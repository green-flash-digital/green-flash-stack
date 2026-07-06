import { existsSync, watch } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { writeFileRecursive } from "@green-flash/ts-utils/node";
import { input } from "@inquirer/prompts";
import { globby } from "globby";
import type { IsoScribeLogLevel } from "isoscribe";
import { Isoscribe, printAsBullets } from "isoscribe";
import prettier from "prettier";

import type { KeystoneDefinition } from "./defineTokens.js";
import { TokensSchema, type KeystoneConfig } from "./schemas/schema.js";
import { defineTemplate } from "./templates/types.js";
import type { TokenManifest } from "./TokenManifest.js";

export { defineTokens } from "./defineTokens.js";
export type { KeystoneConfigInput, KeystoneDefinition } from "./defineTokens.js";
import { colorTemplate } from "./templates/Template.make-color.js";
import { customTemplate } from "./templates/Template.make-custom.js";
import { lightDarkTemplate } from "./templates/Template.make-light-dark.js";
import { semanticTemplate } from "./templates/Template.make-semantic-color.js";
import { fontFamilyTemplate } from "./templates/Template.make-font-family.js";
import { fontVariantTemplate } from "./templates/Template.make-font-variant.js";
import { fontWeightTemplate } from "./templates/Template.make-font-weight.js";
import { pxTemplate } from "./templates/Template.make-px.js";
import { remTemplate } from "./templates/Template.make-rem.js";
import { resetTemplate } from "./templates/Template.make-reset.js";
import { responsiveTemplate } from "./templates/Template.make-responsive.js";
import { sizeTemplate } from "./templates/Template.make-size.js";
import { spaceTemplate } from "./templates/Template.make-space.js";
import type { TokenTemplate } from "./templates/types.js";

export type { TokenTemplate };
export { defineTemplate };

export type TokensConfigDirectories = {
  generated: string;
  versions: string;
};

export type TokensConfigMeta = {
  /** Absolute path to the `.keystone/` directory */
  dirPath: string;
  /** Absolute path to the directory that contains `.keystone/` */
  dirName: string;
  /** Absolute path to `tokens.json` */
  filePath: string;
};

export type TokensConfig = {
  config: KeystoneConfig;
  meta: TokensConfigMeta;
  dirs: TokensConfigDirectories;
};

type GetConfigOptions = {
  noCache?: boolean;
};

export type LogLevel = IsoScribeLogLevel;

/** Walks up from `startDir` looking for `.keystone/tokens.json`. Returns the path or null. */
export async function findKeystoneTokensFile(startDir: string): Promise<string | null> {
  let dir = startDir;
  while (true) {
    const candidate = path.resolve(dir, ".keystone", "tokens.json");
    if (existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Scaffolds a new keystone-css project in `cwd` (defaults to `process.cwd()`).
 * Creates:
 *   .keystone/tokens.json  — token data with $schema reference for VS Code IntelliSense
 *   .keystone/config.ts    — entry point that imports tokens.json
 */
export async function bootstrap(options?: { cwd?: string; prefix?: string }) {
  const rootDir = options?.cwd ?? process.cwd();
  const keystoneDir = path.resolve(rootDir, ".keystone");

  const prefix =
    options?.prefix ??
    (await input({
      message:
        "What prefix would you like to use for your CSS tokens? (https://keystone-css/concepts/token-prefixing)",
      default: path.basename(rootDir)
    }));

  const defaultTokens = TokensSchema.parse({ runtime: { prefix } } as KeystoneConfig);

  const tokensPath = path.resolve(keystoneDir, "tokens.json");
  await writeFileRecursive(
    tokensPath,
    JSON.stringify(
      {
        $schema: "https://schemas.greenflash.digital/keystone-tokens.json",
        ...defaultTokens
      },
      null,
      2
    ) + "\n"
  );

  const configPath = path.resolve(keystoneDir, "config.ts");
  await writeFileRecursive(
    configPath,
    `import tokens from "./tokens.json";\nexport default tokens;\n`
  );

  return { keystoneDir, tokensPath, configPath };
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (
      srcVal !== null &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal) &&
      tgtVal !== null &&
      typeof tgtVal === "object" &&
      !Array.isArray(tgtVal)
    ) {
      deepMerge(tgtVal as Record<string, unknown>, srcVal as Record<string, unknown>);
    } else {
      target[key] = srcVal;
    }
  }
}

export class Keystone {
  private _log: Isoscribe;
  private _config: TokensConfig | undefined = undefined;
  private _configAutoInit: boolean;
  private _inlineDefinition: KeystoneDefinition | undefined;
  private _inlineCwd: string | undefined;

  constructor(options: {
    logLevel?: IsoScribeLogLevel;
    env?: "development" | "production";
    autoInit?: boolean;
    /** Definition produced by `defineTokens()`. When provided, file lookup is skipped. */
    definition?: KeystoneDefinition;
    /** Directory that contains the `.keystone/` folder. Defaults to `process.cwd()`. Required when `definition` is provided. */
    cwd?: string;
  }) {
    const logLevel =
      (process.env.KEYSTONE_CSS_LOG_LEVEL as IsoScribeLogLevel) ?? options.logLevel ?? "info";
    process.env.KEYSTONE_CSS_ENV = options.env ?? process.env.KEYSTONE_CSS_ENV ?? "development";

    this._configAutoInit = options.autoInit ?? false;
    this._inlineDefinition = options.definition;
    this._inlineCwd = options.cwd;
    this._log = new Isoscribe({
      name: "@keystone-css/core",
      logFormat: "string",
      logLevel
    });
  }

  private _getDirsFromMeta(meta: TokensConfigMeta): TokensConfigDirectories {
    return {
      generated: path.resolve(meta.dirPath, "_generated"),
      versions: path.resolve(meta.dirPath, "_versions")
    };
  }

  async getConfig(options?: GetConfigOptions): Promise<TokensConfig> {
    const shouldGetNew = options?.noCache ?? false;
    if (this._config && !shouldGetNew) return this._config;

    // Inline definition path (programmatic use, e.g. tests or monorepo setups)
    if (this._inlineDefinition) {
      const cwd = this._inlineCwd ?? process.cwd();
      const keystoneDir = path.resolve(cwd, ".keystone");
      const meta: TokensConfigMeta = {
        dirPath: keystoneDir,
        dirName: cwd,
        filePath: path.resolve(keystoneDir, "tokens.json")
      };
      this._config = {
        config: this._inlineDefinition.config,
        meta,
        dirs: this._getDirsFromMeta(meta)
      };
      return this._config;
    }

    // tokens.json discovery path
    const tokensFilePath = await findKeystoneTokensFile(process.cwd());

    if (tokensFilePath) {
      const raw = JSON.parse(await readFile(tokensFilePath, "utf8"));
      const config = TokensSchema.parse(raw);
      const keystoneDir = path.dirname(tokensFilePath);
      const meta: TokensConfigMeta = {
        dirPath: keystoneDir,
        dirName: path.dirname(keystoneDir),
        filePath: tokensFilePath
      };
      this._config = { config, meta, dirs: this._getDirsFromMeta(meta) };
      return this._config;
    }

    // No tokens.json found — bootstrap if autoInit, otherwise throw
    if (!this._configAutoInit) {
      throw new Error(
        'Could not locate ".keystone/tokens.json". Run `keystone init` to create one.'
      );
    }

    this._log.warn("Unable to locate .keystone/tokens.json — bootstrapping a new project");
    const { tokensPath } = await bootstrap();

    // Re-read the freshly created file
    const raw = JSON.parse(await readFile(tokensPath, "utf8"));
    const config = TokensSchema.parse(raw);
    const keystoneDir = path.dirname(tokensPath);
    const meta: TokensConfigMeta = {
      dirPath: keystoneDir,
      dirName: path.dirname(keystoneDir),
      filePath: tokensPath
    };
    this._config = { config, meta, dirs: this._getDirsFromMeta(meta) };
    return this._config;
  }

  printError(error: string | Error | unknown) {
    if (error instanceof Error) {
      this._log.fatal(error);
      return;
    }
    if (typeof error === "string") {
      this._log.fatal(new Error(error));
      return;
    }
    this._log.fatal(new Error(String(`Unknown error: ${error}`)));
  }

  async build(options?: GetConfigOptions & { extraTemplates?: TokenTemplate[] }) {
    try {
      const config = await this.getConfig(options);
      this._log.info("Building keystone-css tokens");

      const builtinTemplates: TokenTemplate[] = [
        colorTemplate,
        lightDarkTemplate,
        semanticTemplate,
        customTemplate,
        fontFamilyTemplate,
        fontWeightTemplate,
        fontVariantTemplate,
        spaceTemplate,
        sizeTemplate,
        pxTemplate,
        remTemplate,
        resetTemplate,
        responsiveTemplate
      ];

      const templates: TokenTemplate[] = [
        ...builtinTemplates,
        ...(this._inlineDefinition?.templates ?? []),
        ...(options?.extraTemplates ?? [])
      ];

      // 1. Collect token data from all templates into a single manifest
      this._log.debug("Collecting token manifest...");
      const manifest: Record<string, unknown> = {
        prefix: config.config.runtime.prefix
      };
      for (const template of templates) {
        deepMerge(manifest, template.tokens(config));
      }

      // 2. Write _tokens.ts — the single generated TypeScript file
      this._log.debug("Writing _tokens.ts manifest...");
      const tokensContent =
        `// auto-generated by keystone-css — do not edit\n` +
        `export const tokens = ${JSON.stringify(manifest, null, 2)} as const;\n`;
      await writeFileRecursive(path.resolve(config.dirs.generated, "_tokens.ts"), tokensContent);
      this._log.debug("Writing _tokens.ts manifest... done.");

      // 3. Collect CSS properties and write root.css
      this._log.debug("Generating css :root...");
      let cssProperties: string[] = [];
      for (const template of templates) {
        cssProperties = cssProperties.concat(template.cssProperties(config));
      }
      const rootCSSContent = `:root { ${cssProperties.join(";")} }`;
      await writeFileRecursive(path.resolve(config.dirs.generated, "./root.css"), rootCSSContent);
      this._log.debug("Generating css :root... done.");

      // 4. Generate makeUtils.ts — one export block per template
      this._log.debug("Generating makeUtils.ts...");

      const builtinVarMap = new Map<TokenTemplate, string>([
        [colorTemplate, "colorTemplate"],
        [lightDarkTemplate, "lightDarkTemplate"],
        [semanticTemplate, "semanticTemplate"],
        [customTemplate, "customTemplate"],
        [fontFamilyTemplate, "fontFamilyTemplate"],
        [fontWeightTemplate, "fontWeightTemplate"],
        [fontVariantTemplate, "fontVariantTemplate"],
        [spaceTemplate, "spaceTemplate"],
        [sizeTemplate, "sizeTemplate"],
        [pxTemplate, "pxTemplate"],
        [remTemplate, "remTemplate"],
        [resetTemplate, "resetTemplate"],
        [responsiveTemplate, "responsiveTemplate"]
      ]);

      const importLines: string[] = [
        `import {`,
        `  colorTemplate,`,
        `  lightDarkTemplate,`,
        `  semanticTemplate,`,
        `  customTemplate,`,
        `  fontFamilyTemplate,`,
        `  fontWeightTemplate,`,
        `  fontVariantTemplate,`,
        `  spaceTemplate,`,
        `  sizeTemplate,`,
        `  pxTemplate,`,
        `  remTemplate,`,
        `  resetTemplate,`,
        `  responsiveTemplate,`,
        `} from "@keystone-css/core/templates";`,
        `import { tokens } from "./_tokens.js";`
      ];

      const exportLines: string[] = [];

      for (const template of builtinTemplates) {
        const varName = builtinVarMap.get(template)!;
        const keys = Object.keys(template.util(manifest as unknown as TokenManifest));
        if (keys.length > 0) {
          exportLines.push(`export const { ${keys.join(", ")} } = ${varName}.util(tokens);`);
        }
      }

      const inlineTemplates = this._inlineDefinition?.templates ?? [];
      if (inlineTemplates.length > 0) {
        importLines.push(`import _def from "../config.js";`);
        for (let i = 0; i < inlineTemplates.length; i++) {
          const keys = Object.keys(inlineTemplates[i].util(manifest as unknown as TokenManifest));
          if (keys.length > 0) {
            exportLines.push(
              `export const { ${keys.join(", ")} } = _def.templates[${i}].util(tokens);`
            );
          }
        }
      }

      const makeUtilsContent = [
        `// auto-generated by keystone-css — do not edit`,
        ...importLines,
        ``,
        ...exportLines
      ].join("\n");

      await writeFileRecursive(
        path.resolve(config.dirs.generated, "./makeUtils.ts"),
        makeUtilsContent
      );
      this._log.debug("Generating makeUtils.ts... done.");

      // 5. Generate .keystone/index.ts barrel
      this._log.debug("Generating index.ts barrel...");
      const barrelContent = [
        `// auto-generated by keystone-css — do not edit`,
        `export * from "./_generated/makeUtils.js";`
      ].join("\n");
      await writeFileRecursive(path.resolve(config.meta.dirPath, "./index.ts"), barrelContent);
      this._log.debug("Generating index.ts barrel... done.");

      await this._formatGeneratedFiles();

      this._log.success(
        `Alright, alright alright! Successfully built the "${this._config?.config.runtime.prefix}" tokens & utilities`
      );
    } catch (error) {
      this.printError(error);
    }
  }

  private async _formatGeneratedFiles() {
    this._log.debug("Formatting generated files...");
    const config = await this.getConfig();

    const prettierConfig = await prettier.resolveConfig(config.dirs.generated);
    const files = await globby(
      [
        `${config.dirs.generated}/**/*.{js,ts,jsx,tsx,json,css,md}`,
        path.resolve(config.meta.dirPath, "index.ts")
      ],
      { absolute: true, gitignore: true }
    );

    for (const file of files) {
      const content = await readFile(file, "utf8");
      const formatted = await prettier.format(content, {
        ...prettierConfig,
        filepath: file
      });
      if (formatted !== content) {
        await writeFile(file, formatted, "utf8");
      }
    }

    this._log.debug("Formatting generated files... done.");
    this._log.debug(`Successfully formatted ${files.length} files.`);
  }

  async dev() {
    await this.build({ noCache: true });
    let counter = 1;

    const config = await this.getConfig();
    const watcher = watch(config.meta.filePath);
    const watchedFile = path.relative(process.cwd(), config.meta.filePath);
    this._log.watch(`Running subsequent builds in watch mode

Watching for changes in the following files:${printAsBullets([watchedFile])}
`);
    watcher.on("change", async (file) => {
      const relPath = path.relative(process.cwd(), file);
      counter++;
      this._log.watch(`"${relPath}" changed. Rebuilding.... (${counter}x)`);
      this.build({ noCache: true });
    });
  }
}
