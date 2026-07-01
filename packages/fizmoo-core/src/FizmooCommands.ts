import path from "node:path";
import { exhaustiveMatchGuard, tryHandle } from "ts-jolt/isomorphic";
import {
  type Args,
  type Options,
  type FizmooCommandEntry,
  type FizmooManifestEntry,
  type FizmooUserConfig,
} from "./_fizmoo.types.js";
import { LOG } from "./_fizmoo.utils.js";
import { writeFile } from "node:fs/promises";
import { printAsBullets } from "isoscribe";
import pc from "picocolors";
import { fizmooConstants } from "./_fizmoo.utils.public.js";

type MalformedCommandMode =
  | { type: "CLI_NAME_CONFLICT" }
  | { type: "MISSING_ATTRIBUTE"; description: string };

export class FizmooCommands {
  manifest: Map<string, FizmooManifestEntry>;
  protected _config: FizmooUserConfig;
  protected _dirPath: string;
  rootCommandId: string;

  private _errorReport: {
    MISSING_COMMANDS: Set<string>;
    MALFORMED_COMMAND: Map<string, string[]>;
  };
  private _knownSourcePaths: Set<string>;

  constructor(args: { config: FizmooUserConfig; dirPath: string }) {
    this._config = args.config;
    this._dirPath = args.dirPath;
    this.manifest = new Map();
    this.rootCommandId = fizmooConstants.COMMAND_ROOT;
    this._errorReport = {
      MISSING_COMMANDS: new Set(),
      MALFORMED_COMMAND: new Map(),
    };
    this._knownSourcePaths = new Set(
      this._flattenEntries(this._config.commands).map((e) => e.sourcePath),
    );
  }

  protected get dirs() {
    const binDir = path.resolve(this._dirPath, "../bin");
    const rootDir = path.resolve(this._dirPath, "../");
    return {
      packageJsonPath: path.resolve(rootDir, "./package.json"),
      binDir,
      outDir: binDir,
    };
  }

  /**
   * Named esbuild entry points derived from the command tree.
   * The `out` key maps source file positions to `commands/<rel-path>` in outDir.
   */
  get entryPoints(): { in: string; out: string }[] {
    return this._flattenEntries(this._config.commands).map(
      ({ sourcePath }) => ({
        in: sourcePath,
        out: this._outKey(sourcePath),
      }),
    );
  }

  private _flattenEntries(
    entries: FizmooCommandEntry[],
  ): { sourcePath: string }[] {
    return entries.flatMap((entry) => {
      const sourcePath = path.resolve(this._dirPath, entry.file);
      const children = entry.commands
        ? this._flattenEntries(entry.commands)
        : [];
      return [{ sourcePath }, ...children];
    });
  }

  /**
   * Output key relative to outDir (no extension).
   * e.g. `.fizmoo/commands/build.ts` → `commands/build`
   */
  private _outKey(sourcePath: string): string {
    return path.relative(this._dirPath, sourcePath).replace(/\.(ts|tsx)$/, "");
  }

  /**
   * File path relative to binDir used in the manifest.
   * e.g. `.fizmoo/commands/build.ts` → `./commands/build.js`
   */
  private _outFile(sourcePath: string): string {
    return "./" + this._outKey(sourcePath) + ".js";
  }

  async processFile(filePath: string) {
    if (this._knownSourcePaths.has(filePath)) {
      LOG.debug(`Compiled command: ${path.relative(this._dirPath, filePath)}`);
    }
  }

  /**
   * Recursively walks the FizmooCommandEntry tree, imports each compiled
   * output file to read `module.default`, and builds the manifest entries.
   *
   * Command IDs are derived from the `name` field in each `defineCommand()`
   * call, joined with dots to reflect nesting depth:
   *   root-level "build" → commandId "build"
   *   child "watch" under "build" → commandId "build.watch"
   */
  private async _buildManifestFromTree(
    entries: FizmooCommandEntry[],
    parentCommandId: string | null,
    ancestors: string[],
  ): Promise<void> {
    for (const entry of entries) {
      const sourcePath = path.resolve(this._dirPath, entry.file);
      const outFile = this._outFile(sourcePath);
      const absoluteOutPath = path.resolve(this.dirs.binDir, outFile);
      const srcRelPath = path.relative(path.dirname(this._dirPath), sourcePath);

      LOG.debug(`Reading compiled command: ${outFile}`);
      const mod = await import(`${absoluteOutPath}?t=${Date.now()}`);
      const def = mod.default;

      const name: string =
        def?.name ?? path.basename(entry.file, path.extname(entry.file));
      const commandId = parentCommandId ? `${parentCommandId}.${name}` : name;

      if (name === this._config.name) {
        this._addMalformedCommandError(srcRelPath, {
          type: "CLI_NAME_CONFLICT",
        });
      }

      this.manifest.set(commandId, {
        src: srcRelPath,
        file: outFile,
        parents: ancestors.length > 0 ? [...ancestors] : null,
        subCommands: null,
        properties: {
          name: def?.name ?? "",
          description: def?.description ?? "",
          args: def?.args,
          options: {
            help: {
              type: "boolean",
              required: false,
              alias: "h",
              description: "Display the help menu",
            },
            ...def?.options,
          },
          hasAction: typeof def?.action === "function",
          help: "",
        },
      });

      if (entry.commands?.length) {
        await this._buildManifestFromTree(entry.commands, commandId, [
          ...ancestors,
          commandId,
        ]);
      }
    }
  }

  private getCmdSegments(commandId: string) {
    return commandId.split(".");
  }

  private async writeManifestToDisk() {
    LOG.checkpointStart("Manifest:writing");
    const manifestPath = path.resolve(this.dirs.binDir, "fizmoo.manifest.json");
    const manifestContent = JSON.stringify(
      Object.fromEntries(this.manifest.entries()),
      null,
      2,
    );
    const res = await tryHandle(writeFile)(manifestPath, manifestContent);
    if (res.hasError) throw LOG.fatal(res.error);
    LOG.checkpointEnd();
  }

  private _validateManifest() {
    LOG.checkpointStart("Manifest:validate");
    const allCommandIds = [...this.manifest.keys()];

    for (const [commandId, command] of this.manifest.entries()) {
      LOG.debug(`Validating "${commandId}"...`);

      if (command.parents) {
        for (const parentId of command.parents) {
          if (!this.manifest.has(parentId)) {
            this._errorReport.MISSING_COMMANDS.add(parentId);
          }
        }
      }

      if (commandId !== this.rootCommandId) {
        if (!command.properties.name) {
          this._addMalformedCommandError(command.src, {
            type: "MISSING_ATTRIBUTE",
            description: "Missing a `name` in defineCommand.",
          });
        }
        if (!command.properties.description) {
          this._addMalformedCommandError(command.src, {
            type: "MISSING_ATTRIBUTE",
            description: "Missing a `description` in defineCommand.",
          });
        }

        const hasSubCommands = allCommandIds.some(
          (cmdId) => cmdId !== commandId && cmdId.startsWith(commandId + "."),
        );
        if (!hasSubCommands && !command.properties.hasAction) {
          this._addMalformedCommandError(command.src, {
            type: "MISSING_ATTRIBUTE",
            description:
              "Missing an `action` in defineCommand. Leaf commands must have an action.",
          });
        }
      }

      LOG.debug(`Validating "${commandId}"... done.`);
    }

    this._printErrorReport();
    LOG.checkpointEnd();
  }

  private _addMalformedCommandError(
    filePath: string,
    error: MalformedCommandMode,
  ) {
    const currentError =
      this._errorReport.MALFORMED_COMMAND.get(filePath) ?? [];

    function getErrorText() {
      switch (error.type) {
        case "CLI_NAME_CONFLICT":
          return `${pc.bold(
            "CLI_NAME_CONFLICT",
          )}: A command cannot have the same name as the CLI itself. Rename it in defineCommand.`;
        case "MISSING_ATTRIBUTE":
          return `${pc.bold("MISSING_ATTRIBUTE")}: ${error.description}`;
        default:
          exhaustiveMatchGuard(error);
      }
    }

    this._errorReport.MALFORMED_COMMAND.set(
      filePath,
      currentError.concat(getErrorText()),
    );
  }

  private _printErrorReport() {
    const hasMissingFiles = this._errorReport.MISSING_COMMANDS.size > 0;
    const hasInvalidCommands = this._errorReport.MALFORMED_COMMAND.size > 0;
    let report = "";

    if (!hasMissingFiles && !hasInvalidCommands) return;

    if (hasMissingFiles) {
      report = report.concat(`
${pc.underline("Missing Commands:")}
A command was referenced as a parent in config but has no file entry.
${printAsBullets([...this._errorReport.MISSING_COMMANDS.values()])}
`);
    }

    if (hasInvalidCommands) {
      const errors = [...this._errorReport.MALFORMED_COMMAND.entries()]
        .map(
          ([filePath, value]) =>
            `${pc.underline(filePath)}${printAsBullets(value)}`,
        )
        .join("\n\n");
      report = report.concat(`
${pc.bold(pc.redBright("Invalid Commands:"))}

${errors}
`);
    }

    throw LOG.fatal(
      new Error(
        `There was an error when validating the generated fizmoo manifest.\n${report}\n`,
      ),
    );
  }

  private formatHelpCommandTitle(title: string) {
    return pc.bold(pc.underline(title));
  }

  private _enrichCommandHelp(
    commandId: string,
    commandEntry: FizmooManifestEntry,
  ): FizmooManifestEntry {
    LOG.debug(`"${commandId}" - Building help menu...`);
    const helpMenu: string[] = [];
    this._enrichCommandHelpUsage(commandId, commandEntry, helpMenu);
    this._enrichCommandHelpDescription(commandEntry, helpMenu);
    this._enrichCommandHelpSubCommands(commandEntry, helpMenu);
    this._enrichCommandHelpArgs(commandEntry, helpMenu);
    this._enrichCommandHelpOptions(commandEntry, helpMenu);
    const help = helpMenu.join("\n");
    LOG.debug(`"${commandId}" - Building help menu... done`);
    return {
      ...commandEntry,
      properties: { ...commandEntry.properties, help },
    };
  }

  private _enrichCommandHelpUsage(
    commandId: string,
    { subCommands, properties: { args, options } }: FizmooManifestEntry,
    helpMenu: string[],
  ) {
    helpMenu.push(this.formatHelpCommandTitle("Usage:"));

    const expression =
      commandId === this.rootCommandId
        ? this._config.name
        : `${this._config.name} ${commandId.replace(/\./g, " ")}`;

    const optsDef: Options = options ?? {};
    const argsDef: Args = args ?? {};
    const optionEntries = Object.entries(optsDef);
    const argEntries = Object.entries(argsDef);

    const argVals = argEntries.reduce(
      (accum, [argName, argValue]) => {
        if (argValue.required) {
          return { ...accum, required: accum.required.concat(` <${argName}>`) };
        }
        return accum;
      },
      { required: "", optional: " [args]" },
    );

    const subCommandStr = (subCommands ?? []).length > 0 ? " <subcommand>" : "";
    const argStr =
      argEntries.length === 0 ? "" : `${argVals.required}${argVals.optional}`;
    const optStr = optionEntries.length === 0 ? "" : " [--options]";

    helpMenu.push(`  ${expression}${subCommandStr}${argStr}${optStr}`);
    helpMenu.push("");
  }

  private _enrichCommandHelpDescription(
    { properties: { description } }: FizmooManifestEntry,
    helpMenu: string[],
  ) {
    helpMenu.push(this.formatHelpCommandTitle("Description:"));
    helpMenu.push(`  ${description}`);
    helpMenu.push("");
  }

  private _enrichCommandHelpSubCommands(
    { subCommands }: FizmooManifestEntry,
    helpMenu: string[],
  ) {
    const subCmdsIds = subCommands ?? [];
    if (subCmdsIds.length === 0) return;

    helpMenu.push(this.formatHelpCommandTitle("Sub-commands:"));

    const maxLength = subCmdsIds.reduce<number>((accum, subCmdId) => {
      const length = (this.manifest.get(subCmdId)?.properties.name ?? "")
        .length;
      return length > accum ? length : accum;
    }, 0);

    for (const subCommandId of subCmdsIds) {
      const subCommandEntry = this.manifest.get(subCommandId);
      if (!subCommandEntry) continue;
      const { name, description } = subCommandEntry.properties;
      helpMenu.push(`  ${name.padEnd(maxLength)}  ${description}`);
    }

    helpMenu.push("");
  }

  private _enrichCommandHelpArgs(
    { properties: { args } }: FizmooManifestEntry,
    helpMenu: string[],
  ) {
    const argsDef: Args = args ?? {};
    const argEntries = Object.entries(argsDef);
    if (argEntries.length === 0) return;

    helpMenu.push(this.formatHelpCommandTitle("Arguments:"));

    const maxLength = argEntries.reduce<number>(
      (accum, [argName]) => (argName.length > accum ? argName.length : accum),
      0,
    );

    for (const [argName, arg] of argEntries) {
      let choices = "";
      let validations = "";

      switch (arg.type) {
        case "string": {
          if (arg.choices) choices = `choices: [${arg.choices.join(", ")}]`;
          if (arg.length) {
            const parts = Object.entries(arg.length).map(
              ([k, v]) => `${k}: ${v}`,
            );
            validations = `length: [${parts.join(", ")}]`;
          }
          break;
        }
        case "number": {
          if (arg.choices) choices = `choices: [${arg.choices.join(", ")}]`;
          if (arg.range) {
            const parts = Object.entries(arg.range).map(
              ([k, v]) => `${k}: ${v}`,
            );
            validations = `range: [${parts.join(", ")}]`;
          }
          break;
        }
        case "boolean":
          break;
        default:
          exhaustiveMatchGuard(arg);
      }

      const type = arg.required ? `<${arg.type}>` : `[${arg.type}]`;
      const requirement = arg.required ? "required" : "optional";
      const defaulted =
        arg.default !== undefined ? `default: ${arg.default}` : null;
      const descRoot = `${arg.description} ${type}`;
      const descVals = [requirement, choices, validations, defaulted]
        .filter(Boolean)
        .join(", ");
      helpMenu.push(
        `  ${argName.padEnd(maxLength)}  ${descRoot} ${pc.dim(
          `(${descVals})`,
        )}`,
      );
    }
    helpMenu.push("");
  }

  private _enrichCommandHelpOptions(
    { properties: { options } }: FizmooManifestEntry,
    helpMenu: string[],
  ) {
    const optsDef: Options = options ?? {};
    const optEntries = Object.entries(optsDef);
    if (optEntries.length === 0) return;

    helpMenu.push(this.formatHelpCommandTitle("Options:"));

    // Column width based on the full "--name, -alias" display string
    const maxLength = optEntries.reduce<number>((accum, [optName, option]) => {
      const full = `--${optName}${option.alias ? `, -${option.alias}` : ""}`;
      return full.length > accum ? full.length : accum;
    }, 0);

    for (const [optName, option] of optEntries) {
      const name = `--${optName}`;
      const alias = option.alias ? `, -${option.alias}` : "";
      const type = option.required ? `<${option.type}>` : `[${option.type}]`;
      const optionName = `${name}${alias}`;
      // No nested parens: "default: true" not "(default: true)"
      const defaultVal =
        option.default !== undefined ? `default: ${option.default}` : null;
      const requirement = option.required ? "required" : "optional";
      const descProps = pc.dim(
        `(${[requirement, defaultVal].filter(Boolean).join(", ")})`,
      );
      helpMenu.push(
        `  ${optionName.padEnd(maxLength)}  ${
          option.description
        } ${type} ${descProps}`,
      );
    }
    helpMenu.push("");
  }

  private _enrichCommandSubCommands(
    commandId: string,
    commandEntry: FizmooManifestEntry,
  ): FizmooManifestEntry {
    LOG.debug(`"${commandId}" - Finding sub-commands...`);
    const allCommandIds = [...this.manifest.keys()];
    const commandLevel = this.getCmdSegments(commandId).length;
    const subCommands = allCommandIds.filter((cmdId) => {
      const cmdLevel = this.getCmdSegments(cmdId).length;
      if (commandId === this.rootCommandId) {
        return cmdId !== this.rootCommandId && cmdLevel === 1;
      }
      return cmdId.startsWith(commandId + ".") && commandLevel + 1 === cmdLevel;
    });
    LOG.debug(`"${commandId}" - Finding sub-commands... done`);
    return { ...commandEntry, subCommands };
  }

  private async _enrichManifest() {
    LOG.checkpointStart("Enriching manifest");

    this.manifest.set(this.rootCommandId, {
      src: "",
      file: "",
      parents: [],
      subCommands: [],
      properties: {
        name: this._config.name,
        description: this._config.description,
        options: undefined,
        args: undefined,
        hasAction: false,
        help: "",
      },
    });

    await this._buildManifestFromTree(this._config.commands, null, []);

    for (const [cmdId, cmd] of this.manifest.entries()) {
      const withSubCmds = this._enrichCommandSubCommands(cmdId, cmd);
      const withHelp = this._enrichCommandHelp(cmdId, withSubCmds);
      this.manifest.set(cmdId, withHelp);
    }

    LOG.checkpointEnd();
  }

  async buildManifest() {
    try {
      await this._enrichManifest();
      this._validateManifest();
      await this.writeManifestToDisk();
    } catch (error) {
      throw LOG.fatal(new Error(String(error)));
    }
  }
}
