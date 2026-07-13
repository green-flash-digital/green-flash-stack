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
import matter from "gray-matter";
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
  documintsConfigSchema,
  type DocumintConfigHeader,
  type DocumintResolvedHeader,
  type DocumintResolvedHeaderLink,
  type DocumintsConfig,
  type DocumintsOrderEntry
} from "./config/_config.utils.js";
import { handleRequestDev } from "./server.dev/index.js";
import { renderRouteToHTML } from "./server.static/index.js";
import { LOG } from "./utils/util.logger.js";
import { slugify, unslugify } from "./utils/util.slugify.js";
import type {
  DocumintRouteManifest,
  DocumintRouteManifestEntry,
  DocumintRouteManifestGraphObject
} from "./utils/util.types.js";

const CONFIG_DIRNAME = ".documints";

/** Default glob, resolved relative to `.documints/`. Override via `config.docs`. */
const DEFAULT_DOC_GLOB = "./**/*.doc.{md,mdx,tsx}";

export type ResolvedDocumintsConfig = {
  config: DocumintsConfig;
  paths: { rootDir: string; documintsDir: string };
  dirs: DocumintsDirs;
};

export type DocumintsDirs = {
  /**
   * The anchor that the `docs` glob and each doc's display-only `aliasPath`
   * are resolved relative to - the `.documints/` directory itself, not a
   * fixed "content" subfolder. This is what lets `config.docs` point anywhere
   * reachable via a relative path, including outside `.documints/` entirely
   * (e.g. a sibling `content/` folder at the project root, one level up).
   * Each doc's generated `import()` uses its absolute `fullPath` instead of
   * an alias built from this root, since that path commonly needs to escape
   * `.documints/` via a `../` segment glob-based plugin filters won't match.
   */
  srcDocs: {
    root: string;
    public: string;
    /**
     * Raw HTML inserted as-is into `<head>`, if `.documints/head.html`
     * exists - a favicon link, a self-hosted font's `@font-face` block,
     * social preview meta tags, etc. Optional; no file means no extra head
     * content.
     */
    head: string;
  };
  /**
   * `root` is Vite's project root for both `dev()` and `build()` - the whole
   * app shell (`Layout`, `App`, etc.) plus the 4 "harness" files
   * (`entry.client.tsx`, `entry.server.tsx`, `entry.server.static.tsx`,
   * `routes.ts`) that wire a specific consumer project's virtual routes into
   * that shell. Everything under this root compiles fresh, every time -
   * there's no pre-built package boundary to cross, so shell edits hot-reload
   * exactly like a consumer's own doc edits do.
   */
  entry: {
    root: string;
    viteCacheDir: string;
    appEntryServer: string;
    appEntryClient: string;
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

type DocumintsFrontmatter = {
  /**
   * A slash-delimited hierarchy path, e.g. "Guides/Deployment". Each segment
   * becomes a nested section in the nav, and the last segment is both the
   * page's display title and (slugified) its URL segment.
   */
  title: string;
  /**
   * Overrides the auto-slugified last segment of the URL without changing
   * the displayed title, e.g. title "Guides/Deployment" + slug "deploy"
   * routes to "/guides/deploy" but still displays as "Deployment".
   */
  slug?: string;
  /**
   * Marks this doc as the site's home page, served at "/". Its `title` is
   * still used for display purposes, but it's excluded from the nav tree.
   */
  home?: boolean;
};

const TSX_FRONTMATTER_COMMENT = /^\s*\/\*\*\s*\r?\n---\r?\n([\s\S]*?)\r?\n---\s*\r?\n\*\/\s*/;

export class Documints {
  #config: DocumintsConfig;
  #paths: ResolvedDocumintsConfig["paths"];
  #dirs: DocumintsDirs;

  private constructor(args: ResolvedDocumintsConfig) {
    this.#config = args.config;
    this.#paths = args.paths;
    this.#dirs = args.dirs;
    this.dev = this.dev.bind(this);
    this.build = this.build.bind(this);
  }

  // ---------------------------------------------------------------------
  // Finding / locating - static, since no instance exists yet at this point
  // ---------------------------------------------------------------------

  /**
   * Resolves this package's own installed root (the directory containing
   * `src/app/` and `dist/`) by walking up from wherever this module is
   * actually running. This can't assume a fixed depth relative to
   * `import.meta.dirname`: when imported directly it's `dist/`, but esbuild
   * bundling the `.fizmoo/commands/*` entry points could in principle inline
   * this module too, changing that depth. Matching on this package's own
   * `package.json` name handles both without hardcoding either depth.
   */
  private static getPackageRoot(): string {
    let dir = import.meta.dirname;
    while (true) {
      try {
        const packageJson = JSON.parse(readFileSync(path.resolve(dir, "./package.json"), "utf8"));
        if (packageJson.name === "documints") return dir;
      } catch {
        // no readable/parsable package.json here - keep walking up
      }
      const parent = path.dirname(dir);
      if (parent === dir) {
        throw new Error("Could not locate the documints package root.");
      }
      dir = parent;
    }
  }

  /**
   * Reads `.documints/head.html`, if present, so its raw contents can be
   * inserted as-is into `<head>`. Absent by default - most projects don't
   * need one.
   */
  private static readHeadHtml(dotDirPath: string): string {
    try {
      return readFileSync(path.resolve(dotDirPath, "./head.html"), "utf8");
    } catch {
      return "";
    }
  }

  /**
   * Returns absolute path directories for referencing where a documints
   * project's content lives, where documints' own app shell lives, and where
   * build output should go. `dotDirPath` is the resolved `.documints/`
   * directory found in the consuming project.
   */
  private static getDirectories(dotDirPath: string): DocumintsDirs {
    const packageRoot = Documints.getPackageRoot();
    const entryRoot = path.resolve(packageRoot, "./src/app");

    const serverEntryFileName =
      process.env.NODE_ENV === "production" ? "entry.server.static.tsx" : "entry.server.tsx";

    return {
      srcDocs: {
        root: dotDirPath,
        public: path.resolve(dotDirPath, "./public"),
        head: Documints.readHeadHtml(dotDirPath)
      },
      entry: {
        root: entryRoot,
        viteCacheDir: path.resolve(dotDirPath, "./.vite-cache"),
        appEntryServer: path.resolve(entryRoot, serverEntryFileName),
        appEntryClient: path.resolve(entryRoot, "./entry.client.tsx")
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
    // config.ts doesn't import defineDocumintsOrdering out of the box, but a
    // stub has to exist from the start regardless - config.ts gets bundled by
    // loadConfig() before any Documints instance exists to compute a route
    // manifest and overwrite this with the real thing, so if a project's
    // config.ts is hand-edited to import it before the first dev/build run,
    // there needs to be something on disk to resolve against.
    const orderTypesPath = path.resolve(dotDir, "./.generated/order.ts");

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
      ".vite-cache\n.server-build\nstatic\n.generated\n"
    );
    if (gitignoreRes.success === false) throw gitignoreRes.error;

    const orderTypesRes = await tryHandle(writeFileRecursive)(
      orderTypesPath,
      Documints.renderOrderTypesFile("")
    );
    if (orderTypesRes.success === false) throw orderTypesRes.error;

    return configPath;
  }

  /**
   * `.generated/` is gitignored (it's rebuilt on every dev/build, see
   * `writeOrderTypesFile`), so a fresh clone won't have `order.ts` on disk
   * yet - but `config.ts` may still `import { defineDocumintsOrdering } from
   * "./.generated/order.js"`, and that has to resolve the moment `loadConfig`
   * bundles it below, well before a route manifest exists to generate the
   * real file from. Writing an empty stub first (only if nothing's there
   * already) guarantees the import always resolves; the real,
   * literal-typed version overwrites it moments later once `dev()`/`build()`
   * actually runs.
   */
  private static async ensureOrderTypesStub(dotDirPath: string): Promise<void> {
    const orderTypesPath = path.resolve(dotDirPath, "./.generated/order.ts");
    const res = await tryHandle(access)(orderTypesPath);
    if (res.success) return;
    await writeFileRecursive(orderTypesPath, Documints.renderOrderTypesFile(""));
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
      await Documints.ensureOrderTypesStub(found.dirPath);
      const config = await Documints.loadConfig(found.configFile);
      const dirs = Documints.getDirectories(found.dirPath);
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
  // Parsing - static helpers are pure (no instance state needed); instance
  // methods below them operate on this.#config/#paths/#dirs directly
  // ---------------------------------------------------------------------

  /**
   * `.doc.tsx` files can't start with a literal YAML frontmatter block (`---`
   * isn't valid TSX), so the same YAML lives inside a leading block comment
   * instead:
   *
   * ```tsx
   * /**
   * ---
   * title: Guides/Playground
   * ---
   * *\/
   * ```
   *
   * Extracting it this way keeps frontmatter parsing pure text, same as
   * `.doc.md` - no need to transpile or execute the file (and resolve its real
   * imports) just to discover its route.
   */
  private static extractTsxFrontmatterSource(fileContent: string): string | null {
    const match = fileContent.match(TSX_FRONTMATTER_COMMENT);
    if (!match) return null;
    return `---\n${match[1]}\n---\n`;
  }

  private static getDocumentConfigFromFrontmatter(
    routeId: string,
    filepath: string
  ): DocumintsFrontmatter {
    try {
      LOG.debug(`Parsing file frontmatter: "${filepath}"`);
      const fileContent = readFileSync(filepath, { encoding: "utf8" });

      const isTsx = path.extname(filepath) === ".tsx";
      const matterSource = isTsx ? Documints.extractTsxFrontmatterSource(fileContent) : fileContent;

      if (matterSource === null) {
        throw new Error(
          "Missing frontmatter comment block. Add one at the top of the file:\n" +
            "/**\n---\ntitle: Guides/Playground\n---\n*/"
        );
      }

      const { data } = matter(matterSource) as { data: Partial<DocumintsFrontmatter> };

      if (!data.title) {
        throw new Error(
          'Missing required "title" frontmatter field. Every .doc file needs a "title" ' +
            '(e.g. "Guides/Deployment") that determines its place in the navigation hierarchy.'
        );
      }

      return {
        title: data.title,
        slug: data.slug,
        home: data.home ?? false
      };
    } catch (error) {
      throw LOG.fatal(
        new Error(`Error when trying to parse the frontmatter for "${routeId}": ${error}`)
      );
    }
  }

  /**
   * Resolves any `{ type: "section", title }` header links against the route
   * graph into a fully-populated `dropdown` link, whose items are that
   * section's child pages. The client only ever sees the resolved shape - it
   * has no notion of doc structure, so `section` never reaches the bundle.
   */
  private static resolveDocumintsHeader(
    header: DocumintConfigHeader | undefined,
    routeGraph: DocumintRouteManifestGraphObject
  ): DocumintResolvedHeader | undefined {
    if (!header) return undefined;
    if (!header.links) return { ...header, links: undefined };

    const links = header.links.map((linkSection) =>
      linkSection.map((link): DocumintResolvedHeaderLink => {
        if (link.type !== "section") return link;

        const sectionKey = slugify(link.title);
        const sectionNode = routeGraph[sectionKey];
        if (!sectionNode) {
          throw new Error(
            `Header link references section "${link.title}", but no top-level doc section resolves to "/${sectionKey}". Check the "title" of that section's index page.`
          );
        }

        return {
          type: "dropdown",
          text: link.title,
          items: Object.values(sectionNode.pages).map((page) => ({
            href: page.routePath,
            text: page.fileNameFormatted
          }))
        };
      })
    );

    return { ...header, links };
  }

  /**
   * Takes the route manifest and recursively turns it into a graphical
   * representation of the routes, nesting each entry by its route-path
   * segments. Path-agnostic to how those segments were derived - it only
   * reads `routePath`, never adds or removes manifest properties.
   */
  private static getDocumintRouteGraph(
    routeManifest: DocumintRouteManifest
  ): DocumintRouteManifestGraphObject {
    const graphObj: DocumintRouteManifestGraphObject = {};

    function addRouteGraphNode(manifestEntry: DocumintRouteManifestEntry) {
      const manifestEntrySegments = manifestEntry.routePath.split("/").filter(Boolean);

      let currentGraphObj = graphObj;

      for (const segmentIndex in manifestEntrySegments) {
        const i = Number(segmentIndex);
        const segment = manifestEntrySegments[segmentIndex];
        if (!currentGraphObj[segment]) {
          LOG.debug(`Segment "${segment}" doesn't exist. Creating nested graph.`);
          currentGraphObj[segment] = {
            aliasPath: "",
            fullPath: "",
            fileName: "",
            fileNameFormatted: unslugify(segment),
            root: false,
            routePath: "",
            synthetic: true,
            pages: {}
          };
        }

        if (i === manifestEntrySegments.length - 1) {
          currentGraphObj[segment] = {
            ...manifestEntry,
            pages: currentGraphObj[segment].pages
          };
        } else {
          currentGraphObj = currentGraphObj[segment].pages;
        }
      }
    }

    const manifestEntries = Object.values(routeManifest);
    for (const manifestEntry of manifestEntries) {
      LOG.debug(`Adding "${manifestEntry.routePath}" to the route graph...`);
      addRouteGraphNode(manifestEntry);
      LOG.debug(`Adding "${manifestEntry.routePath}" to the route graph... done.`);
    }

    return graphObj;
  }

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

    const pattern = this.#config.docs ?? DEFAULT_DOC_GLOB;
    LOG.debug(`Discovering docs matching "${pattern}" (from "${this.#dirs.srcDocs.root}")...`);
    const matches = globbySync(pattern, {
      cwd: this.#dirs.srcDocs.root,
      absolute: true,
      onlyFiles: true,
      ignore: ["**/node_modules/**", "**/.git/**"]
    });

    for (const direntFullPath of matches) {
      // path.relative (not a naive string split) since globby's absolute
      // paths don't necessarily string-match path.resolve()'s output exactly.
      const aliasPath = `/${path.relative(this.#dirs.srcDocs.root, direntFullPath).split(path.sep).join("/")}`;
      LOG.debug(`Creating manifest entry for doc: ${aliasPath}`);

      const frontmatter = Documints.getDocumentConfigFromFrontmatter(aliasPath, direntFullPath);
      const routePath = this.getRoutePathFromFrontmatter(frontmatter);
      const titleSegments = frontmatter.title
        .split("/")
        .map((segment) => segment.trim())
        .filter(Boolean);
      const fileNameFormatted = titleSegments[titleSegments.length - 1] ?? frontmatter.title;
      // The real on-disk filename, not the (possibly `slug`-overridden) URL
      // segment - this is what `order` matches leaf entries against, since
      // it's what's actually visible when browsing the docs folder.
      const fileName = path.basename(direntFullPath).replace(/\.doc\.(md|mdx|tsx)$/, "");

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
        fullPath: direntFullPath,
        fileName,
        fileNameFormatted,
        routePath,
        root: routePath === "/",
        synthetic: false
      };
    }

    if (!this.#config.order) return routeManifest;
    LOG.debug("Detected an order to the docs... ordering the manifest.");

    return this.orderRouteManifest(routeManifest);
  }

  /**
   * Walks one `order` array (either a top-level section's, or a nested
   * group's) and inserts the manifest entries it names into
   * `orderedRouteManifest`, in the given sequence. A string entry names a
   * leaf directly under `pathPrefix` by its real on-disk filename (not its
   * URL slug, which may differ via `slug` frontmatter) - filenames are what's
   * actually visible when browsing the docs folder, so they're the more
   * discoverable identifier to write in config.ts. An object entry
   * (`{ [key]: [...] }`) names a nested group by its URL segment instead,
   * since that's the only identifier a synthetic group (e.g. "introduction",
   * see `getDocumintRouteGraph`) has - it has no file of its own - and
   * recurses into its own order array, letting that group's own children be
   * reordered too.
   */
  private orderRouteManifestEntries(
    routeManifest: DocumintRouteManifest,
    orderedRouteManifest: DocumintRouteManifest,
    pathPrefix: string,
    entries: DocumintsOrderEntry[]
  ): void {
    for (const entry of entries) {
      if (typeof entry === "string") {
        const match = Object.entries(routeManifest).find(([routePath, manifestEntry]) => {
          const parentPath = routePath.slice(0, routePath.lastIndexOf("/")) || "/";
          return parentPath === pathPrefix && manifestEntry.fileName === entry;
        });
        if (match) {
          const [routePath, manifestEntry] = match;
          orderedRouteManifest[routePath] = manifestEntry;
        }
        continue;
      }
      for (const groupKey in entry) {
        this.orderRouteManifestEntries(
          routeManifest,
          orderedRouteManifest,
          `${pathPrefix}/${groupKey}`,
          entry[groupKey]
        );
      }
    }
  }

  /**
   * Reads `config.order` and re-inserts entries into a new manifest in the
   * desired sequence: the home page first, then each configured section's
   * index page followed by its pages (and any nested groups' pages) in the
   * order given, then anything left over in whatever order it was
   * discovered.
   */
  private orderRouteManifest(routeManifest: DocumintRouteManifest): DocumintRouteManifest {
    LOG.debug("Ordering docs...");
    const orderedRouteManifest: DocumintRouteManifest = {};

    const homeEntry = routeManifest["/"];
    if (homeEntry) orderedRouteManifest["/"] = homeEntry;

    for (const section in this.#config.order) {
      const sectionIndexPath = `/${section}`;
      if (routeManifest[sectionIndexPath]) {
        orderedRouteManifest[sectionIndexPath] = routeManifest[sectionIndexPath];
      }

      this.orderRouteManifestEntries(
        routeManifest,
        orderedRouteManifest,
        sectionIndexPath,
        this.#config.order[section] ?? []
      );
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
    const routeGraph = Documints.getDocumintRouteGraph(routeManifest);
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
  importComponent: async () => await import(${JSON.stringify(routeIndex.fullPath)})
};
export const routeGraph = ${JSON.stringify(routeGraph, null, 2)};
export const routeDocs = [${Object.values(routeDocs).map(
      (routeEntry) => `{
  routePath: "${routeEntry.routePath}",
  aliasPath: ${JSON.stringify(routeEntry.aliasPath)},
  fileName: ${JSON.stringify(routeEntry.fileName)},
  fileNameFormatted: ${JSON.stringify(routeEntry.fileNameFormatted)},
  root: "${routeEntry.root}",
  importComponent: async () => await import(${JSON.stringify(routeEntry.fullPath)})
}`
    )}];
  `;

    const resolvedHeader = Documints.resolveDocumintsHeader(this.#config.header, routeGraph);
    const data = `export const header = ${JSON.stringify(resolvedHeader)}`;

    return {
      "virtual:routes": routes,
      "virtual:data": data
    };
  }

  /**
   * Builds the literal-type union for one level of `order` entries from its
   * route-graph node's children. A real, doc-backed child is offerable as a
   * plain leaf using its on-disk filename (`"getting-started"`, matching
   * `orderRouteManifestEntries`'s filename-based leaf matching) - a synthetic
   * group (see `getDocumintRouteGraph`) has no file, so it's never offered as
   * a plain leaf. Any child with its own children, real or synthetic, is
   * additionally offerable as `{ "introduction": [...] }` keyed by its URL
   * segment (the only identifier a synthetic group has), recursing into its
   * own children so nested groups can have their contents reordered too.
   */
  private static renderOrderEntryUnion(children: DocumintRouteManifestGraphObject): string {
    const parts: string[] = [];
    for (const [key, node] of Object.entries(children)) {
      if (!node.synthetic) parts.push(JSON.stringify(node.fileName));
      if (Object.keys(node.pages).length > 0) {
        const nestedUnion = Documints.renderOrderEntryUnion(node.pages);
        parts.push(`{ ${JSON.stringify(key)}: (${nestedUnion})[] }`);
      }
    }
    return parts.join(" | ") || "never";
  }

  /**
   * Writes `.documints/.generated/order.ts`: a literal-typed `DocumintsOrder`
   * interface (one key per top-level section, a recursive union of its full
   * child tree - leaves and nested groups alike) plus a
   * `defineDocumintsOrdering` identity function typed against it, so
   * `config.ts`'s `order` gets autocomplete and a compile error for a
   * typo'd or stale slug instead of the silent no-op `orderRouteManifest`
   * gives it otherwise. Regenerated on every route-manifest rebuild, so it's
   * only ever as stale as the currently-running `dev`/`build`.
   */
  private static renderOrderTypesFile(sectionFields: string): string {
    return `// Auto-generated by documints during dev/build - do not edit by hand.
// Regenerates whenever your docs change. If you just added a new section,
// group, or leaf and don't see it here yet, restart \`documints dev\`.

export type DocumintsOrderEntry = string | { [groupKey: string]: DocumintsOrderEntry[] };

export interface DocumintsOrder {
  // Keeps DocumintsOrder assignable to config.ts's
  // Record<string, DocumintsOrderEntry[]> "order" field - the literal-typed
  // properties below narrow known sections.
  [section: string]: DocumintsOrderEntry[] | undefined;
${sectionFields}
}

export function defineDocumintsOrdering(order: DocumintsOrder): DocumintsOrder {
  return order;
}
`;
  }

  private async writeOrderTypesFile(routeManifest: DocumintRouteManifest): Promise<void> {
    const routeGraph = Documints.getDocumintRouteGraph(routeManifest);

    const sectionFields = Object.entries(routeGraph)
      .map(([section, node]) => {
        const entryUnion = Documints.renderOrderEntryUnion(node.pages);
        return `  ${JSON.stringify(section)}?: (${entryUnion})[];`;
      })
      .join("\n");

    const outputPath = path.resolve(this.#dirs.srcDocs.root, "./.generated/order.ts");
    await writeFileRecursive(outputPath, Documints.renderOrderTypesFile(sectionFields));
  }

  /**
   * The static (non-glob) directory prefix of a glob pattern, e.g.
   * `"../docs/**\/*.doc.{md,mdx,tsx}"` -> `"../docs"`. `config.docs` commonly
   * points outside `.documints/` entirely (a sibling `docs/` folder, for
   * instance), so the dev watcher can't assume doc content always lives
   * under `srcDocs.root` - it needs this to know what to actually watch.
   */
  private static getGlobStaticBase(pattern: string): string {
    const staticSegments: string[] = [];
    for (const segment of pattern.split("/")) {
      if (/[*{}?[\]!()]/.test(segment)) break;
      staticSegments.push(segment);
    }
    return staticSegments.join("/") || ".";
  }

  /**
   * A cheap fingerprint of everything that actually shapes the nav/routes:
   * each route's path, its display label, and its position (`Object.entries`
   * preserves insertion order, so a re-ordered manifest produces a different
   * signature). Two manifests with the same signature mean nothing
   * nav-visible changed - even if a doc's body content did - so there's
   * nothing for `virtual:routes`/`virtual:data` to actually re-serialize.
   */
  private static getRouteManifestSignature(routeManifest: DocumintRouteManifest): string {
    return JSON.stringify(
      Object.entries(routeManifest).map(([routePath, entry]) => [routePath, entry.fileNameFormatted])
    );
  }

  private getVirtualModulesPlugin(): VitePlugin {
    let routeManifest = this.getRouteManifest();
    let vModules = this.getVirtualModules(routeManifest);
    const butteryVirtualModuleIds = Object.keys(vModules);
    const resolvedVModulePrefix = "\0";

    void this.writeOrderTypesFile(routeManifest).catch((error: unknown) => {
      LOG.warn(`Failed to write .documints/.generated/order.ts: ${error}`);
    });

    return {
      name: "vite-plugin-documints-virtual",
      configureServer: (server) => {
        server.watcher.add(this.#dirs.srcDocs.root);
        const docsWatchRoot = path.resolve(
          this.#dirs.srcDocs.root,
          Documints.getGlobStaticBase(this.#config.docs ?? DEFAULT_DOC_GLOB)
        );
        server.watcher.add(docsWatchRoot);
        const configFile = path.resolve(this.#paths.documintsDir, "./config.ts");
        server.watcher.on("all", async (_event, watchedPath) => {
          // Only process doc/config changes - not vite's own cache churn,
          // and not our own generated order.ts, or writing it would
          // re-trigger this handler forever.
          const withinWatchedRoot =
            watchedPath.startsWith(this.#dirs.srcDocs.root) ||
            watchedPath.startsWith(docsWatchRoot);
          if (!withinWatchedRoot) return;
          if (watchedPath.startsWith(this.#dirs.entry.viteCacheDir)) return;
          if (watchedPath.startsWith(path.resolve(this.#dirs.srcDocs.root, "./.generated"))) return;

          // config.ts (header, order, docs glob, ...) is only ever loaded
          // once, in Documints.create() - unlike doc content, nothing else
          // re-reads it, so a saved edit to it would otherwise silently keep
          // using whatever was loaded at server startup. Its effects (e.g.
          // header.logo) aren't all captured by the route-manifest signature
          // below, so a config.ts edit always counts as structural.
          const isConfigChange = watchedPath === configFile;
          if (isConfigChange) {
            LOG.debug("Reloading config.ts");
            this.#config = await Documints.loadConfig(configFile);
          }

          const previousSignature = Documints.getRouteManifestSignature(routeManifest);
          routeManifest = this.getRouteManifest();
          const structureChanged =
            isConfigChange ||
            Documints.getRouteManifestSignature(routeManifest) !== previousSignature;

          if (!structureChanged) {
            // Nothing nav/route-affecting changed - just a doc's own body
            // content (text, JSX, styles). Vite's own HMR (React Refresh,
            // MDX, CSS-in-JS) already handles that in place via its normal
            // module graph, since this file is already watched; forcing a
            // full-reload here would only replace that fine-grained update
            // with a jarring full-page flash for no reason.
            return;
          }

          LOG.info("Detected route/nav-affecting changes in the docs directory. Reloading...");
          vModules = this.getVirtualModules(routeManifest);
          void this.writeOrderTypesFile(routeManifest).catch((error: unknown) => {
            LOG.warn(`Failed to write .documints/.generated/order.ts: ${error}`);
          });

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
    let userDefinedPlugins: VitePlugin[] = [];
    if (typeof this.#config.vitePlugins === "function") {
      LOG.debug("Parsing functional vitePlugins...");
      userDefinedPlugins = this.#config.vitePlugins({
        rootDir: this.#paths.rootDir
      });
      LOG.debug("Parsing functional vitePlugins... done.");
    }
    if (Array.isArray(this.#config.vitePlugins)) {
      LOG.debug("Parsing vitePlugins...");
      userDefinedPlugins = this.#config.vitePlugins;
      LOG.debug("Parsing vitePlugins... done.");
    }

    return defineConfig({
      root: this.#dirs.entry.root,
      cacheDir: this.#dirs.entry.viteCacheDir,
      publicDir: this.#dirs.srcDocs.public,
      resolve: {
        preserveSymlinks: true,
        extensions: [".js", ".jsx", ".ts", ".tsx", ".mdx"]
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
      root: this.#dirs.entry.root,
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
      LOG.debug(`Loading the server entry file "${this.#dirs.entry.appEntryServer}"`);
      const ssrEntryModule = await vite.ssrLoadModule(this.#dirs.entry.appEntryServer);
      await handleRequestDev(ssrEntryModule.render, {
        req,
        res,
        dirs: this.#dirs,
        vite,
        head: this.#dirs.srcDocs.head
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
    // Explicitly awaited (unlike the dev-watcher's fire-and-forget call) since
    // build() calls process.exit() right after finishing, which could cut off
    // an in-flight write from the fire-and-forget call inside getViteConfig().
    await this.writeOrderTypesFile(routeManifest);

    try {
      LOG.debug("Building client bundle for production...");
      await viteBuild({
        logLevel: "silent",
        root: this.#dirs.entry.root,
        ...viteConfig,
        build: {
          emptyOutDir: true,
          manifest: true,
          outDir: this.#dirs.output.root,
          rollupOptions: {
            input: this.#dirs.entry.appEntryClient
          }
        }
      });
      LOG.debug("Building client bundle for production... done");

      LOG.debug("Building server bundle for production...");
      await viteBuild({
        logLevel: "silent",
        root: this.#dirs.entry.root,
        ...viteConfig,
        build: {
          emptyOutDir: true,
          ssr: this.#dirs.entry.appEntryServer,
          outDir: this.#dirs.output.serverBundleDir,
          rollupOptions: {
            output: { entryFileNames: "server.js" }
          }
        }
      });
      LOG.debug("Building server bundle for production... done");

      LOG.debug("Prerendering routes to static HTML...");
      const viteManifestPath = path.resolve(this.#dirs.output.root, "./.vite/manifest.json");
      const viteManifest = JSON.parse(await readFile(viteManifestPath, "utf8"));
      const { render } = await import(
        `${path.resolve(this.#dirs.output.serverBundleDir, "./server.js")}?t=${Date.now()}`
      );

      for (const entry of Object.values(routeManifest)) {
        const html = await renderRouteToHTML(render, {
          routePath: entry.routePath,
          aliasPath: entry.aliasPath,
          vManifest: viteManifest,
          contentRoot: this.#dirs.srcDocs.root,
          viteRoot: this.#dirs.entry.root,
          head: this.#dirs.srcDocs.head
        });
        const outputPath = path.resolve(this.#dirs.output.root, `.${entry.routePath}/index.html`);
        const res = await tryHandle(writeFileRecursive)(outputPath, html);
        if (res.success === false) throw res.error;
      }
      LOG.debug("Prerendering routes to static HTML... done");

      // The SSR bundle was only needed to prerender the routes above -
      // it's never part of the deployed static output.
      await rm(this.#dirs.output.serverBundleDir, { recursive: true, force: true });

      LOG.checkpointEnd();

      const filesAndDirs = await readdir(this.#dirs.output.root, {
        recursive: true,
        withFileTypes: true
      });
      const files = filesAndDirs.filter((dirent) => dirent.isFile());
      LOG.success(`Successfully built documentation app!

      Location: ${this.#dirs.output.root}
      Total Files: ${files.length}
    `);
    } catch (error) {
      throw LOG.fatal(new Error(String(error)));
    }
  }
}
