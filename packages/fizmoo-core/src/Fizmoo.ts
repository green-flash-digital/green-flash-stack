import {
  default as esbuild,
  BuildOptions,
  Plugin as EsbuildPlugin,
} from "esbuild";
import { readFile, rm, writeFile } from "node:fs/promises";
import { FizmooCommands } from "./FizmooCommands.js";
import { tryHandle } from "ts-jolt/isomorphic";
import { writeFileRecursive } from "ts-jolt/node";
import path from "node:path";
import {
  findFizmooConfigFile,
  loadFizmooConfig,
  bootstrap,
  LOG,
} from "./_fizmoo.utils.js";
import { type FizmooUserConfig } from "./_fizmoo.types.js";
import { IsoScribeLogLevel } from "isoscribe";
import { confirm } from "@inquirer/prompts";

export async function createFizmoo(options: {
  logLevel?: IsoScribeLogLevel;
  env?: "development" | "production";
  autoInit: boolean;
}) {
  const logLevel: IsoScribeLogLevel =
    (process.env.FIZMOO_LOG_LEVEL as IsoScribeLogLevel) ??
    options.logLevel ??
    "info";
  process.env.FIZMOO_ENV =
    options.env ?? process.env.FIZMOO_ENV ?? "development";

  LOG.logLevel = logLevel;

  LOG.debug("Locating the .fizmoo/config.ts file...");
  const found = await findFizmooConfigFile();

  if (found) {
    LOG.debug(`Found config: ${found.configFile}`);
    const config = await loadFizmooConfig(found.configFile);
    return new Fizmoo({ config, dirPath: found.dirPath });
  }

  LOG.warn("Unable to locate .fizmoo/config.ts.");
  let shouldBootstrap = false;

  if (options.autoInit) {
    LOG.debug(
      "autoInit is enabled. Bootstrapping the required fizmoo directories and files.",
    );
    shouldBootstrap = true;
  } else {
    shouldBootstrap = await confirm({
      message: "Would you like to bootstrap fizmoo now?",
    });
  }

  if (!shouldBootstrap) {
    LOG.fatal(
      new Error(
        "No .fizmoo/config.ts found. Run `fizmoo build` in a directory containing a .fizmoo/config.ts file.",
      ),
    );
    return null;
  }

  const resBootstrap = await tryHandle(bootstrap)();
  if (resBootstrap.hasError) {
    LOG.fatal(resBootstrap.error);
    return null;
  }

  return createFizmoo(options);
}

export class Fizmoo extends FizmooCommands {
  private _isInDevMode: boolean;

  constructor(args: { config: FizmooUserConfig; dirPath: string }) {
    super(args);
    this._isInDevMode = false;
    this._init();
    this.build = this.build.bind(this);
    this.dev = this.dev.bind(this);
  }

  get buildConfig(): BuildOptions {
    return {
      bundle: true,
      minify: process.env.FIZMOO_ENV === "production",
      format: "esm",
      platform: "node",
      target: ["node23.3.0"],
      packages: "external",
      logOverride: { "empty-glob": "silent" },
      entryPoints: this.entryPoints,
      outdir: this.dirs.outDir,
      plugins: [
        this._pluginWatchLogger(),
        this._pluginProcessFilesAndCommands(),
        this._pluginEnrichPackageJSON(),
        this._pluginValidateAndBuildManifest(),
      ].filter((p): p is EsbuildPlugin => !!p),
    };
  }

  private _pluginProcessFilesAndCommands(): EsbuildPlugin {
    return {
      name: "esbuild-plugin-fizmoo-commands-log",
      setup: (build) => {
        build.onLoad({ filter: /.*/, namespace: "file" }, async (args) => {
          await this.processFile(args.path);
          return null;
        });
      },
    };
  }

  private _pluginEnrichPackageJSON(): EsbuildPlugin {
    return {
      name: "esbuild-plugin-fizmoo-enrich-pkgjson",
      setup: (build) => {
        build.onStart(async () => {
          const packageJsonString = await readFile(this.dirs.packageJsonPath, {
            encoding: "utf8",
          });
          const packageJson = JSON.parse(packageJsonString);
          const additions = {
            type: "module",
            bin: { [this._config.name]: "./bin/index.js" },
          };
          for (const [key, value] of Object.entries(additions)) {
            if (!(key in packageJson)) {
              LOG.debug(`Adding '${key}' to package.json.`);
              packageJson[key] = value;
            }
          }
          await writeFile(
            this.dirs.packageJsonPath,
            `${JSON.stringify(packageJson, null, 2)}\n`,
            "utf-8",
          );
        });
      },
    };
  }

  private _pluginValidateAndBuildManifest(): EsbuildPlugin {
    return {
      name: "esbuild-plugin-fizmoo-manifest",
      setup: (build) => {
        build.onEnd(async () => {
          await this.buildManifest();
        });
      },
    };
  }

  private _pluginWatchLogger(): EsbuildPlugin | undefined {
    if (!this._isInDevMode) return undefined;

    let isWatching = false;
    return {
      name: "watch-logger",
      setup(build) {
        build.onEnd((result) => {
          if (!isWatching && result.errors.length === 0) {
            isWatching = true;
            LOG.watch("Listening for changes");
            return;
          }
          if (isWatching) LOG.debug("Rebuilding");
        });
      },
    };
  }

  private async _init() {
    const res = await tryHandle(rm)(this.dirs.binDir, {
      recursive: true,
      force: true,
    });
    if (res.hasError) throw res.error;

    const entryFilePath = path.resolve(this.dirs.binDir, "./index.js");
    const entryFileContent = `import { FizmooRuntime } from "@fizmoo/core/runtime";
import manifest from "./fizmoo.manifest.json" with { type: "json" };

const runtime = new FizmooRuntime(manifest, { cwd: import.meta.dirname });

runtime.execute().catch((error) => {
  console.error(error);
  process.exit(1);
});
`;
    const entryRes = await tryHandle(writeFileRecursive)(
      entryFilePath,
      entryFileContent,
    );
    if (entryRes.hasError) throw entryRes.error;
  }

  async checkForCommands() {
    if (this._config.commands.length === 0) {
      LOG.warn(
        "No commands declared in .fizmoo/config.ts. Add at least one using the command() helper.",
      );
    }
  }

  async build() {
    LOG.info(`Building "${this._config.name}" CLI...`);
    try {
      const res = await esbuild.build(this.buildConfig);
      LOG.success("Done!");
      return res;
    } catch (error) {
      LOG.fatal(new Error(String(error)));
    }
  }

  async dev() {
    LOG.info("Starting the fizmoo development server...");

    await this.checkForCommands();

    try {
      this._isInDevMode = true;
      const context = await esbuild.context(this.buildConfig);
      await context.watch();
    } catch (error) {
      this._isInDevMode = false;
      LOG.fatal(new Error(String(error)));
    }
  }
}
