import {
  type Args,
  type FizmooManifest,
  type FizmooManifestEntry,
  type Option,
  type Options,
} from "../_fizmoo.types.js";
import { fizmooConstants } from "../_fizmoo.utils.public.js";
import path from "node:path";
import { exhaustiveMatchGuard, tryHandleSync } from "ts-jolt/isomorphic";
import { RuntimeError } from "./utils/util.error.js";

type RuntimeOption =
  | { type: "expanded"; value: string | undefined; raw: string }
  | { type: "alias"; value: string | undefined; raw: string };
type RuntimeOptionsMap = Map<string, RuntimeOption>;

export class FizmooRuntime {
  _manifest: Map<string, FizmooManifestEntry>;
  private _commandOptions: Map<string, string | number | boolean>;
  private _commandArgs: Map<string, string | number | boolean>;
  private _cwd: string;
  private _errors: RuntimeError;

  constructor(manifest: FizmooManifest, options?: { cwd?: string }) {
    this._manifest = new Map(Object.entries(manifest));
    this._cwd = options?.cwd ?? import.meta.dirname;
    this._commandOptions = new Map();
    this._commandArgs = new Map();
    this._errors = new RuntimeError({
      cliName:
        this._manifest.get(fizmooConstants.COMMAND_ROOT)?.properties.name ??
        "<your cli>",
    });
    this._parseExpression = this._parseExpression.bind(this);
    this._setCommandOptions = this._setCommandOptions.bind(this);
    this._setCommandArgs = this._setCommandArgs.bind(this);
  }

  /**
   * Parses --option and -alias tokens from argv into a keyed map.
   * Handles both `--flag=value` and `--flag value` styles.
   */
  private _parseExpressionOptions(rawOptions: string[]): RuntimeOptionsMap {
    const optionsMap = new Map<string, RuntimeOption>();

    for (const rawOption of rawOptions) {
      const [optionKey, optionValue] = rawOption.split("=");

      if (optionKey.startsWith("--")) {
        const optionId = optionKey.slice(2);
        optionsMap.set(optionId, {
          type: "expanded",
          value: optionValue,
          raw: rawOption,
        });
        continue;
      }

      if (optionKey.startsWith("-")) {
        const optionId = optionKey.slice(1);
        optionsMap.set(optionId, {
          type: "alias",
          value: optionValue,
          raw: rawOption,
        });
        continue;
      }

      throw this._errors.MALFORMED_OPTION(rawOption);
    }

    return optionsMap;
  }

  /**
   * Parses positional arguments from argv. Args are matched to their
   * definitions by position (order matters), not by name.
   */
  private _parseExpressionArgs(rawArgs: string[]): string[] {
    return rawArgs;
  }

  /**
   * Walks process.argv to extract the deepest matching command ID,
   * then separates the remaining tokens into positional args and options.
   */
  private _parseExpression() {
    const commandParts = process.argv.slice(2);
    let commandPath: string[] = [];
    let remainingArgs = [...commandParts];
    let commandId = "";

    while (remainingArgs.length > 0) {
      const possibleCommand = commandPath.length
        ? `${commandPath.join(".")}.${remainingArgs[0]}`
        : remainingArgs[0];

      if (this._manifest.get(possibleCommand)) {
        commandId = possibleCommand;
        commandPath.push(remainingArgs.shift()!);
      } else {
        break;
      }
    }

    // Separate option tokens from positional args.
    // Supports both --key=value and --key value forms: when a flag token has
    // no "=" and the next token doesn't start with "-", treat the next token
    // as its value and combine them into --key=value.
    const optionsRaw: string[] = [];
    const argsRaw: string[] = [];
    let i = 0;
    while (i < remainingArgs.length) {
      const token = remainingArgs[i];
      if (token.startsWith("-")) {
        if (token.includes("=")) {
          optionsRaw.push(token);
          i++;
        } else {
          const next = remainingArgs[i + 1];
          if (next !== undefined && !next.startsWith("-")) {
            optionsRaw.push(`${token}=${next}`);
            i += 2;
          } else {
            optionsRaw.push(token);
            i++;
          }
        }
      } else {
        argsRaw.push(token);
        i++;
      }
    }

    if (commandId === "" && argsRaw.length > 0) {
      throw this._errors.COMMAND_NOT_FOUND(argsRaw[0]);
    }

    if (commandId === "") {
      commandId = fizmooConstants.COMMAND_ROOT;
    }

    const options = this._parseExpressionOptions(optionsRaw);
    const args = this._parseExpressionArgs(argsRaw);

    return { commandId, args, options };
  }

  /**
   * Validates and coerces each runtime option against its definition,
   * then stores the typed value in _commandOptions.
   */
  private _setCommandOptions(
    commandDef: FizmooManifestEntry,
    runtimeOptions: RuntimeOptionsMap
  ): void {
    const optionsDef: Options = commandDef.properties.options ?? {};

    for (const [rOptionId, rOption] of runtimeOptions) {
      let optionDef: Option | undefined = undefined;
      // canonicalId is the option's key in the definition (not the alias char)
      let canonicalId = rOptionId;

      switch (rOption.type) {
        case "expanded":
          optionDef = optionsDef[rOptionId];
          if (!optionDef) {
            throw this._errors.OPTION_NOT_FOUND(
              rOptionId,
              "expanded",
              optionsDef
            );
          }
          break;

        case "alias": {
          const aliasEntry = Object.entries(optionsDef).find(
            ([, option]) => option.alias === rOptionId
          );
          if (!aliasEntry) {
            throw this._errors.OPTION_NOT_FOUND(rOptionId, "alias", optionsDef);
          }
          [canonicalId, optionDef] = aliasEntry;
          break;
        }

        default:
          exhaustiveMatchGuard(rOption);
      }

      switch (optionDef.type) {
        case "boolean": {
          let value: boolean | undefined = undefined;
          if (rOption.value === "true") value = true;
          if (rOption.value === "false") value = false;
          if (rOption.value === undefined) {
            value = optionDef.default ?? true;
          }

          if (typeof value !== "boolean") {
            throw this._errors.OPTION_VALIDATION_FAILED({
              optionId: canonicalId,
              message: `Invalid value "${rOption.value}" for boolean option "--${canonicalId}".`,
              suggestion: `Use --${canonicalId}=true, --${canonicalId}=false, or just --${canonicalId} (defaults to true).`,
            });
          }

          this._commandOptions.set(canonicalId, value);
          break;
        }

        case "string": {
          const value = rOption.value ?? optionDef.default;

          if (typeof value !== "string") {
            throw this._errors.OPTION_VALIDATION_FAILED({
              optionId: canonicalId,
              message: `Option "--${canonicalId}" requires a string value.`,
            });
          }

          if (optionDef.validate !== undefined && !optionDef.validate(value)) {
            throw this._errors.OPTION_VALIDATION_FAILED({
              optionId: canonicalId,
              message: `Validation failed for option "--${canonicalId}".`,
            });
          }

          this._commandOptions.set(canonicalId, value);
          break;
        }

        case "number": {
          const value =
            rOption.value !== undefined
              ? Number(rOption.value)
              : optionDef.default;

          if (typeof value === "undefined") {
            throw this._errors.OPTION_VALIDATION_FAILED({
              optionId: canonicalId,
              message: `Option "--${canonicalId}" requires a numeric value.`,
            });
          }

          if (Number.isNaN(value)) {
            throw this._errors.OPTION_VALIDATION_FAILED({
              optionId: canonicalId,
              message: `Option "--${canonicalId}" must be a number, got "${rOption.value}".`,
            });
          }

          if (optionDef.validate !== undefined && !optionDef.validate(value)) {
            throw this._errors.OPTION_VALIDATION_FAILED({
              optionId: canonicalId,
              message: `Validation failed for option "--${canonicalId}".`,
            });
          }

          this._commandOptions.set(canonicalId, value);
          break;
        }

        default:
          exhaustiveMatchGuard(optionDef);
      }
    }

    // Second pass: check required and apply defaults for unset options
    for (const [optionId, optionDef] of Object.entries(optionsDef)) {
      if (this._commandOptions.has(optionId)) continue;

      if (optionDef.required) {
        throw this._errors.OPTION_VALIDATION_FAILED({
          optionId,
          message: `Missing required option "--${optionId}".`,
        });
      }

      if (optionDef.default !== undefined) {
        this._commandOptions.set(optionId, optionDef.default);
      }
    }
  }

  /**
   * Validates and coerces each positional arg against its definition (by index),
   * then stores the typed value in _commandArgs.
   */
  private _setCommandArgs(
    commandDef: FizmooManifestEntry,
    runtimeArgs: string[]
  ): void {
    const argsDef: Args = commandDef.properties.args ?? {};
    const argEntries = Object.entries(argsDef);

    // Reject unexpected extra positional args
    if (runtimeArgs.length > argEntries.length) {
      const unexpected = runtimeArgs[argEntries.length];
      throw this._errors.ARG_VALIDATION_FAILED({
        argId: unexpected,
        message: `Unexpected argument "${unexpected}".`,
        suggestion: `This command accepts ${argEntries.length} argument(s): ${argEntries.map(([k]) => k).join(", ")}.`,
      });
    }

    for (let i = 0; i < argEntries.length; i++) {
      const [argId, argDef] = argEntries[i];
      const rawValue = runtimeArgs[i];

      // Arg not provided — check required and apply default
      if (rawValue === undefined) {
        if (argDef.required) {
          throw this._errors.ARG_VALIDATION_FAILED({
            argId,
            message: `Missing required argument "${argId}".`,
          });
        }
        if ("default" in argDef && argDef.default !== undefined) {
          this._commandArgs.set(argId, argDef.default);
        }
        continue;
      }

      switch (argDef.type) {
        case "boolean": {
          const value =
            rawValue.toLowerCase() === "true" || rawValue === "1";
          this._commandArgs.set(argId, value ?? argDef.default ?? false);
          break;
        }

        case "string": {
          if (argDef.length?.min !== undefined && rawValue.length < argDef.length.min) {
            throw this._errors.ARG_VALIDATION_FAILED({
              argId,
              message: `Argument "${argId}" must be at least ${argDef.length.min} characters.`,
            });
          }
          if (argDef.length?.max !== undefined && rawValue.length > argDef.length.max) {
            throw this._errors.ARG_VALIDATION_FAILED({
              argId,
              message: `Argument "${argId}" must be at most ${argDef.length.max} characters.`,
            });
          }
          if (argDef.choices && !argDef.choices.includes(rawValue)) {
            throw this._errors.ARG_VALIDATION_FAILED({
              argId,
              message: `"${rawValue}" is not a valid value for "${argId}".`,
              suggestion: `Must be one of: ${argDef.choices.join(", ")}.`,
            });
          }
          if (argDef.validate && !argDef.validate(rawValue)) {
            throw this._errors.ARG_VALIDATION_FAILED({
              argId,
              message: `Validation failed for argument "${argId}".`,
            });
          }
          this._commandArgs.set(argId, rawValue);
          break;
        }

        case "number": {
          const parsedValue = Number(rawValue);
          if (Number.isNaN(parsedValue)) {
            throw this._errors.ARG_VALIDATION_FAILED({
              argId,
              message: `Argument "${argId}" must be a number, got "${rawValue}".`,
            });
          }
          if (argDef.range?.min !== undefined && parsedValue < argDef.range.min) {
            throw this._errors.ARG_VALIDATION_FAILED({
              argId,
              message: `Argument "${argId}" must be at least ${argDef.range.min}.`,
            });
          }
          if (argDef.range?.max !== undefined && parsedValue > argDef.range.max) {
            throw this._errors.ARG_VALIDATION_FAILED({
              argId,
              message: `Argument "${argId}" must be at most ${argDef.range.max}.`,
            });
          }
          if (argDef.choices && !argDef.choices.includes(parsedValue)) {
            throw this._errors.ARG_VALIDATION_FAILED({
              argId,
              message: `"${rawValue}" is not a valid value for "${argId}".`,
              suggestion: `Must be one of: ${argDef.choices.join(", ")}.`,
            });
          }
          if (argDef.validate && !argDef.validate(parsedValue)) {
            throw this._errors.ARG_VALIDATION_FAILED({
              argId,
              message: `Validation failed for argument "${argId}".`,
            });
          }
          // FIX: number value was validated but never stored
          this._commandArgs.set(argId, parsedValue);
          break;
        }

        default:
          exhaustiveMatchGuard(argDef);
      }
    }
  }

  public async execute() {
    const commandRes = tryHandleSync(this._parseExpression)();
    if (commandRes.hasError) {
      return this._errors.log(commandRes.error);
    }

    const { commandId, args, options } = commandRes.data;
    const commandDef = this._manifest.get(commandId);
    if (!commandDef) {
      return this._errors.log(this._errors.COMMAND_NOT_FOUND(commandId));
    }

    // Parent commands and --help always print the help menu
    const isParentCommand = (commandDef.subCommands ?? []).length > 0;
    if (options.has("help") || isParentCommand) {
      return console.log(commandDef.properties.help);
    }

    const optionRes = tryHandleSync(this._setCommandOptions)(commandDef, options);
    if (optionRes.hasError) {
      return this._errors.log(optionRes.error);
    }

    const argsRes = tryHandleSync(this._setCommandArgs)(commandDef, args);
    if (argsRes.hasError) {
      return this._errors.log(argsRes.error);
    }

    if (!commandDef.properties.hasAction) {
      return this._errors.log(this._errors.MISSING_ACTION(commandId));
    }

    const importPath = path.resolve(this._cwd, commandDef.file);
    const module = await import(importPath);
    const action = module.default?.action;

    await action({
      options: Object.fromEntries(this._commandOptions.entries()),
      args: Object.fromEntries(this._commandArgs.entries()),
    });
  }
}
