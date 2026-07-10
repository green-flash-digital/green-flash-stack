import { readFileSync } from "node:fs";
import { readFile, readdir, rm, access } from "node:fs/promises";
import http from "node:http";
import path from "node:path";

import { tryHandle } from "@green-flash/ts-utils/isomorphic";
import { writeFileRecursive } from "@green-flash/ts-utils/node";
import { confirm } from "@inquirer/prompts";
import mdx from "@mdx-js/rollup";
import rehypeShiki from "@shikijs/rehype";
import rehypeTOC from "@stefanprobst/rehype-extract-toc";
import rehypeTOCExport from "@stefanprobst/rehype-extract-toc/mdx";
import react from "@vitejs/plugin-react";
import wyw from "@wyw-in-js/vite";
import { default as esbuild } from "esbuild";
import express from "express";
import { globbySync } from "globby";
import { produce } from "immer";
import { printAsBullets } from "logarhythm";
import open from "open";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { type Plugin as VitePlugin, build as viteBuild, createServer, defineConfig } from "vite";

import {
  type DocumintsFrontmatter,
  getDocumentConfigFromFrontmatter
} from "./build/getDocumentConfigFromFrontmatter.js";
import { getDocumintRouteGraph } from "./build/getDocumintRouteGraph.js";
import { resolveDocumintsHeader } from "./build/resolveDocumintsHeader.js";
import { documintsConfigSchema, type DocumintsConfig } from "./config/_config.utils.js";
import { handleRequestDev } from "./lib/server.dev/index.js";
import { renderRouteToHTML } from "./lib/server.static/index.js";
import { LOG } from "./utils/util.logger.js";
import { slugify } from "./utils/util.slugify.js";
import type { DocumintRouteManifest, DocumintRouteManifestEntry } from "./utils/util.types.js";

const CONFIG_DIRNAME = ".documints";

/** Default glob, resolved relative to `.documints/`. Override via `config.docs`. */
const DEFAULT_DOC_GLOB = "./content/**/*.doc.{md,mdx,tsx}";

export type ResolvedDocumintsConfig = {
  config: DocumintsConfig;
  paths: { rootDir: string; documintsDir: string };
  dirs: DocumintsDirs;
};

export type DocumintsDirs = {
  /**
   * The anchor that the `docs` glob, each doc's `aliasPath`, and the `@docs`
   * vite alias are all resolved relative to - the `.documints/` directory
   * itself, not a fixed "content" subfolder. This is what lets `config.docs`
   * point anywhere reachable via a relative path, including outside
   * `.documints/` entirely (e.g. a sibling `content/` folder at the project
   * root, one level up).
   */
  srcDocs: { root: string; public: string };
  app: {
    root: string;
    viteCacheDir: string;
    appEntryServer: string;
    appEntryClient: string;
    css: { docsUI: string };
  };
  output: {
    /** The final, deployable static site - plain HTML/CSS/JS, servable anywhere. */
    root: string;
    /**
     * Where the SSR bundle used to prerender each route gets built.
     * Internal-only: never part of the deployed static output, and removed
     * once the build finishes.
     */
    serverBundleDir: string;
  };
};

type DocumintVirtualModules = {
  "virtual:routes": string;
  "virtual:data": string;
};

export class Documints {
  private _config: DocumintsConfig;
  private _paths: ResolvedDocumintsConfig["paths"];
  private _dirs: DocumintsDirs;

  private constructor(args: ResolvedDocumintsConfig) {
    this._config = args.config;
    this._paths = args.paths;
    this._dirs = args.dirs;
    this.dev = this.dev.bind(this);
    this.build = this.build.bind(this);
  }

  private get rConfig(): ResolvedDocumintsConfig {
    return { config: this._config, paths: this._paths, dirs: this._dirs };
  }

  // ---------------------------------------------------------------------
  // Finding / locating - static, since no instance exists yet at this point
  // ---------------------------------------------------------------------

  /**
   * Resolves this package's own installed root (the directory containing
   * `app/` and `dist/`) by walking up from wherever this module is actually
   * running. This can't assume a fixed depth relative to `import.meta.dirname`:
   * when imported directly it's `dist/`, but the consuming `documints` CLI's
   * esbuild bundling could in principle inline this module too, changing that
   * depth. Matching on this package's own `package.json` name handles both
   * without hardcoding either depth.
   */
  private static getPackageRoot(): string {
    let dir = import.meta.dirname;
    while (true) {
      try {
        const packageJson = JSON.parse(readFileSync(path.resolve(dir, "./package.json"), "utf8"));
        if (packageJson.name === "@documints/core") return dir;
      } catch {
        // no readable/parsable package.json here - keep walking up
      }
      const parent = path.dirname(dir);
      if (parent === dir) {
        throw new Error("Could not locate the @documints/core package root.");
      }
      dir = parent;
    }
  }

  /**
   * Returns absolute path directories for referencing where a documints
   * project's content lives, where documints' own app shell lives, and where
   * build output should go. `dotDirPath` is the resolved `.documints/`
   * directory found in the consuming project.
   */
  private static getDirectories(_config: DocumintsConfig, dotDirPath: string): DocumintsDirs {
    const packageRoot = Documints.getPackageRoot();
    const appRoot = path.resolve(packageRoot, "./app");

    const serverEntryFileName =
      process.env.NODE_ENV === "production" ? "entry.server.static.tsx" : "entry.server.tsx";

    return {
      srcDocs: {
        root: dotDirPath,
        public: path.resolve(dotDirPath, "./_public")
      },
      app: {
        root: appRoot,
        viteCacheDir: path.resolve(dotDirPath, "./.vite-cache"),
        appEntryServer: path.resolve(appRoot, serverEntryFileName),
        appEntryClient: path.resolve(appRoot, "./entry.client.tsx"),
        css: {
          docsUI: path.resolve(packageRoot, "./dist/lib/documints.css")
        }
      },
      output: {
        root: path.resolve(dotDirPath, "./static"),
        serverBundleDir: path.resolve(dotDirPath, "./.server-build")
      }
    };
  }

  /**
   * Walks up the directory tree from startDir (default: cwd) looking for
   * `.documints/config.ts`. Returns the resolved paths on success, null if
   * not found. Mirrors fizmoo-core's own config-file discovery.
   */
  private static async findConfigFile(startDir?: string): Promise<{
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
  private static async loadConfig(configFile: string): Promise<DocumintsConfig> {
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
   * starter home-page doc, and a `.gitignore` for the vite cache, the
   * server-only prerender bundle, and the built static site.
   */
  static async bootstrap(rootDir = process.cwd()): Promise<string> {
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

    const gitignoreRes = await tryHandle(writeFileRecursive)(
      gitignorePath,
      ".vite-cache\n.server-build\nstatic\n"
    );
    if (gitignoreRes.success === false) throw gitignoreRes.error;

    return configPath;
  }

  /**
   * Locates and loads a `.documints/config.ts`, resolving it (and directories
   * derived from it) into a `Documints` instance. If no config is found,
   * offers to bootstrap one (or does so automatically with `autoInit: true`),
   * mirroring fizmoo-core's own `createFizmoo`.
   */
  static async create(options?: { autoInit?: boolean }): Promise<Documints | null> {
    LOG.debug(`Locating the ${CONFIG_DIRNAME}/config.ts file...`);
    const found = await Documints.findConfigFile();

    if (found) {
      LOG.debug(`Found config: ${found.configFile}`);
      const config = await Documints.loadConfig(found.configFile);
      const dirs = Documints.getDirectories(config, found.dirPath);
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

    const res = await tryHandle(Documints.bootstrap)();
    if (res.success === false) {
      LOG.fatal(res.error);
      return null;
    }

    return Documints.create(options);
  }

  // ---------------------------------------------------------------------
  // Parsing - instance methods, operate on this.rConfig
  // ---------------------------------------------------------------------

  /**
   * Turns a doc's frontmatter into its route path. Hierarchy comes from the
   * slash-delimited `title` (Storybook-style), not from where the file lives
   * on disk. `home: true` always resolves to "/" regardless of `title`, since
   * the home page sits outside the nav tree.
   */
  private getRoutePathFromFrontmatter(frontmatter: DocumintsFrontmatter): string {
    if (frontmatter.home) return "/";

    const titleSegments = frontmatter.title
      .split("/")
      .map((segment) => segment.trim())
      .filter(Boolean);

    const slugSegments = titleSegments.map(slugify);
    if (frontmatter.slug) {
      slugSegments[slugSegments.length - 1] = slugify(frontmatter.slug);
    }

    return `/${slugSegments.join("/")}`;
  }

  /**
   * Discovers every `.doc.md`/`.doc.mdx`/`.doc.tsx` file matching
   * `config.docs` (or the default glob), wherever it's nested. A file's
   * location on disk has no bearing on its route - only its `title`
   * frontmatter does.
   */
  private getRouteManifest(): DocumintRouteManifest {
    const routeManifest: DocumintRouteManifest = {};
    const rConfig = this.rConfig;

    const pattern = rConfig.config.docs ?? DEFAULT_DOC_GLOB;
    LOG.debug(`Discovering docs matching "${pattern}" (from "${rConfig.dirs.srcDocs.root}")...`);
    const matches = globbySync(pattern, {
      cwd: rConfig.dirs.srcDocs.root,
      absolute: true,
      onlyFiles: true,
      ignore: ["**/node_modules/**", "**/.git/**"]
    });

    for (const direntFullPath of matches) {
      // path.relative (not a naive string split) since globby's absolute
      // paths don't necessarily string-match path.resolve()'s output exactly.
      const aliasPath = `/${path.relative(rConfig.dirs.srcDocs.root, direntFullPath).split(path.sep).join("/")}`;
      LOG.debug(`Creating manifest entry for doc: ${aliasPath}`);

      const frontmatter = getDocumentConfigFromFrontmatter(aliasPath, direntFullPath);
      const routePath = this.getRoutePathFromFrontmatter(frontmatter);
      const titleSegments = frontmatter.title
        .split("/")
        .map((segment) => segment.trim())
        .filter(Boolean);
      const fileNameFormatted = titleSegments[titleSegments.length - 1] ?? frontmatter.title;
      const routeSegments = routePath.split("/");
      const fileName = routeSegments[routeSegments.length - 1] || "index";

      if (routeManifest[routePath]) {
        LOG.warn(
          `Multiple docs resolve to the route "${routePath}":${printAsBullets([
            routeManifest[routePath].aliasPath,
            aliasPath
          ])}\nThe later one will win. Give one of them a distinct "title" or "slug".`
        );
      }

      routeManifest[routePath] = {
        aliasPath,
        fileName,
        fileNameFormatted,
        routePath,
        root: routePath === "/"
      };
    }

    if (!rConfig.config.order) return routeManifest;
    LOG.debug("Detected an order to the docs... ordering the manifest.");

    return this.orderRouteManifest(routeManifest);
  }

  /**
   * Reads `config.order` and re-inserts entries into a new manifest in the
   * desired sequence: the home page first, then each configured section's
   * index page followed by its pages in the order given, then anything left
   * over in whatever order it was discovered.
   */
  private orderRouteManifest(routeManifest: DocumintRouteManifest): DocumintRouteManifest {
    LOG.debug("Ordering docs...");
    const orderedRouteManifest: DocumintRouteManifest = {};

    const homeEntry = routeManifest["/"];
    if (homeEntry) orderedRouteManifest["/"] = homeEntry;

    for (const section in this._config.order) {
      const sectionIndexPath = `/${section}`;
      if (routeManifest[sectionIndexPath]) {
        orderedRouteManifest[sectionIndexPath] = routeManifest[sectionIndexPath];
      }

      for (const leafSlug of this._config.order[section]) {
        const leafPath = `/${section}/${leafSlug}`;
        if (routeManifest[leafPath]) {
          orderedRouteManifest[leafPath] = routeManifest[leafPath];
        }
      }
    }

    LOG.debug(`Ordering docs... done. Ordered ${Object.keys(orderedRouteManifest).length} routes.`);

    // Append anything not explicitly ordered, preserving discovery order.
    for (const [routePath, entry] of Object.entries(routeManifest)) {
      if (orderedRouteManifest[routePath]) continue;
      orderedRouteManifest[routePath] = entry;
    }

    return orderedRouteManifest;
  }

  // ---------------------------------------------------------------------
  // Building - instance methods
  // ---------------------------------------------------------------------

  private getVirtualModules(routeManifest: DocumintRouteManifest): DocumintVirtualModules {
    const routeGraph = getDocumintRouteGraph(routeManifest);
    const { routeIndex, routeDocs } = Object.entries(routeManifest).reduce<{
      routeIndex: DocumintRouteManifestEntry | undefined;
      routeDocs: DocumintRouteManifest;
    }>(
      (accum, [routeId, routeManifestEntry]) => {
        if (routeManifestEntry.root) {
          return produce(accum, (draft) => {
            draft.routeIndex = routeManifestEntry;
          });
        }
        return produce(accum, (draft) => {
          draft.routeDocs[routeId] = routeManifestEntry;
        });
      },
      { routeIndex: undefined, routeDocs: {} }
    );

    LOG.debug("Validating index file exists...");
    if (typeof routeIndex === "undefined") {
      throw LOG.fatal(
        new Error(
          'Cannot find a home page. Ensure that one of your .doc.md/.doc.mdx files has "home: true" in its frontmatter.'
        )
      );
    }
    LOG.debug("Validating index file exists... done.");

    const routes = `;
export const routeIndex = {
  routePath: "/",
  aliasPath: ${JSON.stringify(routeIndex.aliasPath)},
  fileName: ${JSON.stringify(routeIndex.fileName)},
  fileNameFormatted: ${JSON.stringify(routeIndex.fileNameFormatted)},
  root: "${routeIndex.root}",
  importComponent: async () => await import("@docs${routeIndex.aliasPath}")
};
export const routeGraph = ${JSON.stringify(routeGraph, null, 2)};
export const routeDocs = [${Object.values(routeDocs).map(
      (routeEntry) => `{
  routePath: "${routeEntry.routePath}",
  aliasPath: ${JSON.stringify(routeEntry.aliasPath)},
  fileName: ${JSON.stringify(routeEntry.fileName)},
  fileNameFormatted: ${JSON.stringify(routeEntry.fileNameFormatted)},
  root: "${routeEntry.root}",
  importComponent: async () => await import("@docs${routeEntry.aliasPath}")
}`
    )}];
  `;

    const resolvedHeader = resolveDocumintsHeader(this._config.header, routeGraph);
    const data = `export const header = ${JSON.stringify(resolvedHeader)}`;

    return {
      "virtual:routes": routes,
      "virtual:data": data
    };
  }

  private getVirtualModulesPlugin(): VitePlugin {
    const rConfig = this.rConfig;
    let routeManifest = this.getRouteManifest();
    let vModules = this.getVirtualModules(routeManifest);
    const butteryVirtualModuleIds = Object.keys(vModules);
    const resolvedVModulePrefix = "\0";

    return {
      name: "vite-plugin-buttery-docs-virtual",
      configureServer: (server) => {
        server.watcher.add(rConfig.dirs.srcDocs.root);
        server.watcher.on("all", (_event, watchedPath) => {
          // Only process doc changes - not vite's own cache churn, which now
          // lives under the same watched root since it's the .documints/
          // directory itself, not a fixed "content" subfolder.
          if (!watchedPath.startsWith(rConfig.dirs.srcDocs.root)) return;
          if (watchedPath.startsWith(rConfig.dirs.app.viteCacheDir)) return;
          LOG.info("Detected changes in the docs directory. Reloading...");

          LOG.debug("Rebuilding virtual modules");
          routeManifest = this.getRouteManifest();
          vModules = this.getVirtualModules(routeManifest);

          LOG.checkpointStart("Rebuild Virtual Modules");
          const viteVirtualModuleEntries = [...server.moduleGraph.idToModuleMap.entries()].filter(
            ([virtualModuleId]) => virtualModuleId.includes("virtual")
          );

          LOG.debug("Attempting to match buttery virtual module Ids with those in vite");
          for (const butteryVirtualModuleId of butteryVirtualModuleIds) {
            LOG.debug(`Locating vite virtual module that includes: "${butteryVirtualModuleId}"`);
            const viteVirtualModuleEntry = viteVirtualModuleEntries.find(([viteModId]) =>
              viteModId.includes(butteryVirtualModuleId)
            );

            if (!viteVirtualModuleEntry) {
              LOG.debug(
                `Unable to find vite virtual module match for the buttery virtual module id: ${butteryVirtualModuleId}`
              );
              continue;
            }

            const [viteVirtualModuleId] = viteVirtualModuleEntry;
            LOG.debug(
              `Locating vite virtual module that includes: "buttery:${butteryVirtualModuleId} - vite:${viteVirtualModuleId}`
            );
            const viteVirtualModule = server.moduleGraph.getModuleById(viteVirtualModuleId);
            if (!viteVirtualModule) {
              continue;
            }

            LOG.debug(`Invalidating vModule: ${viteVirtualModuleId}`);
            server.moduleGraph.invalidateModule(viteVirtualModule);
          }
          LOG.checkpointEnd();

          server.ws.send({ type: "full-reload" });
        });
      },
      resolveId(id) {
        const vModuleId = butteryVirtualModuleIds.find((moduleId) => moduleId === id);
        if (vModuleId) return resolvedVModulePrefix.concat(vModuleId);
        return null;
      },
      load(id) {
        const vModuleId = butteryVirtualModuleIds.find(
          (moduleId) => resolvedVModulePrefix.concat(moduleId) === id
        );
        if (vModuleId) {
          return vModules[vModuleId as keyof DocumintVirtualModules];
        }
        return null;
      }
    };
  }

  private getViteConfig() {
    const rConfig = this.rConfig;
    let userDefinedPlugins: VitePlugin[] = [];
    if (typeof rConfig.config.vitePlugins === "function") {
      LOG.debug("Parsing functional vitePlugins...");
      userDefinedPlugins = rConfig.config.vitePlugins({
        rootDir: rConfig.paths.rootDir
      });
      LOG.debug("Parsing functional vitePlugins... done.");
    }
    if (Array.isArray(rConfig.config.vitePlugins)) {
      LOG.debug("Parsing vitePlugins...");
      userDefinedPlugins = rConfig.config.vitePlugins;
      LOG.debug("Parsing vitePlugins... done.");
    }

    return defineConfig({
      root: rConfig.dirs.app.root,
      cacheDir: rConfig.dirs.app.viteCacheDir,
      publicDir: rConfig.dirs.srcDocs.public,
      resolve: {
        preserveSymlinks: true,
        extensions: [".js", ".jsx", ".ts", ".tsx", ".mdx"],
        alias: {
          "@docs": rConfig.dirs.srcDocs.root
        }
      },
      optimizeDeps: {
        include: ["logarhythm", "react", "react-dom", "react-dom/client", "react-router"]
      },
      plugins: [
        mdx({
          remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            rehypeTOC,
            rehypeTOCExport,
            [
              rehypeAutolinkHeadings,
              {
                behavior: "wrap",
                headingProperties: {
                  className: "heading"
                }
              }
            ],
            [
              rehypeShiki,
              {
                theme: "dark-plus"
              }
            ]
          ]
        }),
        react(),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore there's a type mismatch but it doesn't show during compilation
        wyw({
          include: ["**/*.{ts,tsx}"],
          babelOptions: {
            presets: ["@babel/preset-typescript", "@babel/preset-react"]
          }
        }),
        this.getVirtualModulesPlugin(),
        ...userDefinedPlugins
      ]
    });
  }

  // ---------------------------------------------------------------------
  // Running
  // ---------------------------------------------------------------------

  async dev(options?: { port?: number; host?: string; open?: boolean }) {
    process.env.NODE_ENV = "development";
    LOG.info("Starting documints DevServer...");

    const viteConfig = this.getViteConfig();
    const PORT = options?.port ?? 3000;
    const HOSTNAME = `http://${options?.host ?? "localhost"}`;
    const HOSTNAME_AND_PORT = `${HOSTNAME}:${PORT}`;

    const app = express();
    // Vite's HMR websocket needs a real http.Server to attach to - without
    // handing it one via `server.hmr.server`, it spins up a second,
    // standalone websocket-only server instead (defaulting to port 24678,
    // or whatever `hmr.port` is set to), completely disconnected from
    // whatever port this dev server is actually listening on.
    const server = http.createServer(app);

    LOG.debug("Creating vite server & running in middleware mode.");
    const vite = await createServer({
      ...viteConfig,
      root: this._dirs.app.root,
      appType: "custom",
      clearScreen: false,
      server: {
        middlewareMode: true,
        hmr: { server }
      }
    });

    app.use(vite.middlewares);

    // No path argument matches every request regardless of path - simpler
    // and version-proof than a wildcard pattern, since Express 5's router
    // (path-to-regexp v7) dropped the bare "*" wildcard entirely.
    app.use(async (req, res) => {
      LOG.debug(`Loading the server entry file "${this._dirs.app.appEntryServer}"`);
      const ssrEntryModule = await vite.ssrLoadModule(this._dirs.app.appEntryServer);
      await handleRequestDev(ssrEntryModule.render, {
        req,
        res,
        dirs: this._dirs,
        vite
      });
    });

    server.listen(PORT, () => {
      LOG.watch(`documints DevServer running on ${HOSTNAME_AND_PORT}`);
      if (options?.open) open(HOSTNAME_AND_PORT);
    });
  }

  async build() {
    process.env.NODE_ENV = "production";
    LOG.checkpointStart("Building documints");

    const viteConfig = this.getViteConfig();
    const routeManifest = this.getRouteManifest();

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
            input: this._dirs.app.appEntryClient
          }
        }
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
            output: { entryFileNames: "server.js" }
          }
        }
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
          viteRoot: this._dirs.app.root
        });
        const outputPath = path.resolve(this._dirs.output.root, `.${entry.routePath}/index.html`);
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
        withFileTypes: true
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
