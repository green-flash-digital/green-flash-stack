import { access, readFile, readdir, rm } from "node:fs/promises";
import path from "node:path";

import { tryHandle } from "@green-flash/ts-utils/isomorphic";
import { writeFileRecursive } from "@green-flash/ts-utils/node";
import { confirm } from "@inquirer/prompts";
import { default as esbuild } from "esbuild";
import express from "express";
import open from "open";
import { build as viteBuild, createServer } from "vite";

import { getButteryDocsViteConfig } from "./build/getButteryDocsViteConfig.js";
import { getDocumintsRouteManifest } from "./build/getDocumintsRouteManifest.js";
import { documintsConfigSchema, type DocumintsConfig } from "./config/_config.utils.js";
import { getDocumintsDirectories, type DocumintsDirs } from "./config/getDocumintsDirectories.js";
import { handleRequestDev } from "./lib/server.dev/handleRequest.dev.js";
import { renderRouteToHTML } from "./lib/server.static/renderRouteToHTML.js";
import { LOG } from "./utils/util.logger.js";

const CONFIG_DIRNAME = ".documints";

export type ResolvedDocumintsConfig = {
  config: DocumintsConfig;
  paths: { rootDir: string; documintsDir: string };
  dirs: DocumintsDirs;
};

/**
 * Walks up the directory tree from startDir (default: cwd) looking for
 * `.documints/config.ts`. Returns the resolved paths on success, null if not
 * found. Mirrors fizmoo-core's own config-file discovery.
 */
async function findDocumintsConfigFile(startDir?: string): Promise<{
  configFile: string;
  dirPath: string;
} | null> {
  let dir = startDir ?? process.cwd();
  while (true) {
    const configFile = path.resolve(dir, `${CONFIG_DIRNAME}/config.ts`);
    const res = await tryHandle(access)(configFile);
    if (res.success) {
      return { configFile, dirPath: path.resolve(dir, CONFIG_DIRNAME) };
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Compiles `.documints/config.ts` with esbuild in-process, imports the
 * result, and validates it against the config schema. Mirrors fizmoo-core's
 * own `loadFizmooConfig`.
 */
async function loadDocumintsConfig(configFile: string): Promise<DocumintsConfig> {
  const tempFile = path.resolve(path.dirname(configFile), `_documints_config_${Date.now()}.mjs`);
  try {
    await esbuild.build({
      entryPoints: [configFile],
      outfile: tempFile,
      bundle: true,
      format: "esm",
      platform: "node",
      packages: "external",
      logLevel: "silent"
    });
    const mod = await import(tempFile);
    if (!mod.default) {
      throw new Error(
        "config.ts must have a default export: `export default defineDocumintsConfig({ ... })`"
      );
    }
    const result = documintsConfigSchema.safeParse(mod.default);
    if (!result.success) throw result.error;
    // Return the raw default export (not the parsed result) so that
    // non-serializable fields like `vitePlugins` functions survive.
    return mod.default as DocumintsConfig;
  } finally {
    await rm(tempFile, { force: true }).catch(() => undefined);
  }
}

/**
 * Interactively scaffolds a new `.documints/` project: the config file, a
 * starter home-page doc, and a `.gitignore` for the vite cache.
 */
export async function bootstrapDocumints(rootDir = process.cwd()) {
  const dotDir = path.resolve(rootDir, CONFIG_DIRNAME);
  const configPath = path.resolve(dotDir, "./config.ts");
  const welcomeDocPath = path.resolve(dotDir, "./content/welcome.doc.md");
  const gitignorePath = path.resolve(dotDir, "./.gitignore");

  const configContent = `import { defineDocumintsConfig } from "documints";

export default defineDocumintsConfig({});
`;

  const welcomeDocContent = `---
title: Welcome
home: true
---

# Welcome

This is your new documints site. Edit this file at \`.documints/content/welcome.doc.md\`,
or add more \`*.doc.md\` files anywhere under \`.documints/content/\` - their place in the
nav comes from their \`title\` frontmatter (e.g. "Guides/Deployment"), not where you put them.
`;

  const configRes = await tryHandle(writeFileRecursive)(configPath, configContent);
  if (configRes.success === false) throw configRes.error;

  const welcomeRes = await tryHandle(writeFileRecursive)(welcomeDocPath, welcomeDocContent);
  if (welcomeRes.success === false) throw welcomeRes.error;

  const gitignoreRes = await tryHandle(writeFileRecursive)(gitignorePath, ".vite-cache\n");
  if (gitignoreRes.success === false) throw gitignoreRes.error;

  return configPath;
}

/**
 * Locates and loads a `.documints/config.ts`, resolving it (and directories
 * derived from it) into a `Documints` instance. If no config is found, offers
 * to bootstrap one (or does so automatically with `autoInit: true`), mirroring
 * fizmoo-core's own `createFizmoo`.
 */
export async function createDocumints(options?: { autoInit?: boolean }): Promise<Documints | null> {
  LOG.debug(`Locating the ${CONFIG_DIRNAME}/config.ts file...`);
  const found = await findDocumintsConfigFile();

  if (found) {
    LOG.debug(`Found config: ${found.configFile}`);
    const config = await loadDocumintsConfig(found.configFile);
    const dirs = getDocumintsDirectories(config, found.dirPath);
    return new Documints({
      config,
      paths: {
        rootDir: path.dirname(found.dirPath),
        documintsDir: found.dirPath
      },
      dirs
    });
  }

  LOG.warn(`Unable to locate ${CONFIG_DIRNAME}/config.ts.`);
  let shouldBootstrap = false;

  if (options?.autoInit) {
    LOG.debug("autoInit is enabled. Bootstrapping the required documints directories and files.");
    shouldBootstrap = true;
  } else {
    shouldBootstrap = await confirm({
      message: "Would you like to bootstrap documints now?"
    });
  }

  if (!shouldBootstrap) {
    LOG.fatal(
      new Error(
        `No ${CONFIG_DIRNAME}/config.ts found. Run \`documints init\` to bootstrap a new project.`
      )
    );
    return null;
  }

  const res = await tryHandle(bootstrapDocumints)();
  if (res.success === false) {
    LOG.fatal(res.error);
    return null;
  }

  return createDocumints(options);
}

export class Documints {
  private _config: DocumintsConfig;
  private _paths: ResolvedDocumintsConfig["paths"];
  private _dirs: DocumintsDirs;

  constructor(args: ResolvedDocumintsConfig) {
    this._config = args.config;
    this._paths = args.paths;
    this._dirs = args.dirs;
    this.dev = this.dev.bind(this);
    this.build = this.build.bind(this);
  }

  private get rConfig(): ResolvedDocumintsConfig {
    return { config: this._config, paths: this._paths, dirs: this._dirs };
  }

  async dev(options?: { port?: number; host?: string; open?: boolean }) {
    process.env.NODE_ENV = "development";
    LOG.info("Starting documints DevServer...");

    const viteConfig = getButteryDocsViteConfig(this.rConfig);
    const PORT = options?.port ?? 3000;
    const HOSTNAME = `http://${options?.host ?? "localhost"}`;
    const HOSTNAME_AND_PORT = `${HOSTNAME}:${PORT}`;

    const app = express();

    LOG.debug("Creating vite server & running in middleware mode.");
    const vite = await createServer({
      ...viteConfig,
      root: this._dirs.app.root,
      appType: "custom",
      clearScreen: false,
      server: {
        middlewareMode: true,
        hmr: { port: 3005 }
      }
    });

    app.use(vite.middlewares);

    app.use("*", async (req, res) => {
      LOG.debug(`Loading the server entry file "${this._dirs.app.appEntryServer}"`);
      const ssrEntryModule = await vite.ssrLoadModule(this._dirs.app.appEntryServer);
      await handleRequestDev(ssrEntryModule.render, {
        req,
        res,
        dirs: this._dirs,
        vite
      });
    });

    app.listen(PORT, () => {
      LOG.watch(`documints DevServer running on ${HOSTNAME_AND_PORT}`);
      if (options?.open) open(HOSTNAME_AND_PORT);
    });
  }

  async build() {
    process.env.NODE_ENV = "production";
    LOG.checkpointStart("Building documints");

    const viteConfig = getButteryDocsViteConfig(this.rConfig);
    const routeManifest = getDocumintsRouteManifest(this.rConfig);

    try {
      LOG.debug("Building client bundle for production...");
      await viteBuild({
        logLevel: "silent",
        root: this._dirs.app.root,
        ...viteConfig,
        build: {
          emptyOutDir: true,
          manifest: true,
          outDir: this._dirs.output.root,
          rollupOptions: {
            input: this._dirs.app.appEntryClient,
          },
        },
      });
      LOG.debug("Building client bundle for production... done");

      LOG.debug("Building server bundle for production...");
      await viteBuild({
        logLevel: "silent",
        root: this._dirs.app.root,
        ...viteConfig,
        build: {
          emptyOutDir: true,
          ssr: this._dirs.app.appEntryServer,
          outDir: this._dirs.output.serverBundleDir,
          rollupOptions: {
            output: { entryFileNames: "server.js" },
          },
        },
      });
      LOG.debug("Building server bundle for production... done");

      LOG.debug("Prerendering routes to static HTML...");
      const viteManifestPath = path.resolve(this._dirs.output.root, "./.vite/manifest.json");
      const viteManifest = JSON.parse(await readFile(viteManifestPath, "utf8"));
      const { render } = await import(
        `${path.resolve(this._dirs.output.serverBundleDir, "./server.js")}?t=${Date.now()}`
      );

      for (const entry of Object.values(routeManifest)) {
        const html = await renderRouteToHTML(render, {
          routePath: entry.routePath,
          aliasPath: entry.aliasPath,
          vManifest: viteManifest,
          contentRoot: this._dirs.srcDocs.root,
        });
        const outputPath = path.resolve(
          this._dirs.output.root,
          `.${entry.routePath}/index.html`
        );
        const res = await tryHandle(writeFileRecursive)(outputPath, html);
        if (res.success === false) throw res.error;
      }
      LOG.debug("Prerendering routes to static HTML... done");

      // The SSR bundle was only needed to prerender the routes above -
      // it's never part of the deployed static output.
      await rm(this._dirs.output.serverBundleDir, { recursive: true, force: true });

      LOG.checkpointEnd();

      const filesAndDirs = await readdir(this._dirs.output.root, {
        recursive: true,
        withFileTypes: true,
      });
      const files = filesAndDirs.filter((dirent) => dirent.isFile());
      LOG.success(`Successfully built documentation app!

      Location: ${this._dirs.output.root}
      Total Files: ${files.length}
    `);
    } catch (error) {
      throw LOG.fatal(new Error(String(error)));
    }
  }
}
