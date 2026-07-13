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

/** Default glob for finding docs, resolved relative to `.documints/`. Override via `config.docs`. */
const DEFAULT_DOC_GLOB = "./**/*.doc.{md,mdx,tsx}";

export type DocumintsDirs = {
  /** The directory one level up from `.documints/` - the consumer's own project root. */
  projectRootDir: string;
  /** `.documints/` itself. Anchor for the docs glob and each doc's display-only `aliasPath`. */
  docsContentDir: string;
  /** Static assets served as-is (favicon, images, etc). */
  docsPublicDir: string;
  /** Raw contents of `head.html`, if it exists. Not a path - this is the actual HTML string. */
  headHtml: string;
  /** `.documints/config.ts` */
  configFilePath: string;
  /** `.documints/.generated/` - gitignored, rebuilt on every `dev`/`build`. */
  generatedDir: string;
  /** `.documints/.generated/order.ts`, exporting `defineDocumintsOrdering`. */
  orderTypesPath: string;
  /** Vite's project root for both `dev()` and `build()` - the app shell plus the harness files. */
  appShellDir: string;
  viteCacheDir: string;
  appEntryClientPath: string;
  appEntryServerPath: string;
  /** The final, deployable static site. */
  staticOutputDir: string;
  /** Temporary SSR bundle used to prerender routes. Deleted once the build finishes. */
  serverBundleDir: string;
};

type DocumintsInstanceArgs = {
  config: DocumintsConfig;
  dirs: DocumintsDirs;
};

type DocumintVirtualModules = {
  "virtual:routes": string;
  "virtual:data": string;
};

type DocumintsFrontmatter = {
  /** A slash-delimited hierarchy, e.g. "Guides/Deployment". Each segment becomes a nav section. */
  title: string;
  /** Overrides the URL's last segment without changing the displayed title. */
  slug?: string;
  /** Marks this doc as the home page, served at "/" and left out of the nav tree. */
  home?: boolean;
};

const TSX_FRONTMATTER_COMMENT = /^\s*\/\*\*\s*\r?\n---\r?\n([\s\S]*?)\r?\n---\s*\r?\n\*\/\s*/;

export class Documints {
  /** Well-known file and folder names inside a documints project. */
  private static readonly FILE_NAMES = {
    config: "config.ts",
    headHtml: "head.html",
    gitignore: ".gitignore",
    welcomeDoc: "content/welcome.doc.md",
    public: "public",
    viteCacheDir: ".vite-cache",
    staticOutputDir: "static",
    serverBundleDir: ".server-build",
    generatedDir: ".generated",
    orderTypes: ".generated/order.ts",
    clientEntry: "entry.client.tsx",
    devServerEntry: "entry.server.tsx",
    staticServerEntry: "entry.server.static.tsx"
  } as const;

  #config: DocumintsConfig;
  #dirs: DocumintsDirs;

  private constructor(args: DocumintsInstanceArgs) {
    this.#config = args.config;
    this.#dirs = args.dirs;
    this.dev = this.dev.bind(this);
    this.build = this.build.bind(this);
  }

  // ---------------------------------------------------------------------
  // Finding / locating - static, since no instance exists yet at this point
  // ---------------------------------------------------------------------

  /**
   * Finds this package's own installed root (the folder containing `src/app/`
   * and `dist/`) by walking up from wherever this module is running. The
   * depth from here isn't fixed - it changes depending on whether this file
   * is loaded directly or bundled - so we walk up until we find a
   * `package.json` named "documints" instead of assuming a fixed depth.
   */
  private static getPackageRoot(): string {
    let dir = import.meta.dirname;
    while (true) {
      try {
        const packageJson = JSON.parse(readFileSync(path.resolve(dir, "./package.json"), "utf8"));
        if (packageJson.name === "documints") return dir;
      } catch {
        // no readable package.json here - keep walking up
      }
      const parent = path.dirname(dir);
      if (parent === dir) {
        throw new Error("Could not locate the documints package root.");
      }
      dir = parent;
    }
  }

  /** Reads `.documints/head.html`, if present, so it can be inserted as-is into `<head>`. */
  private static readHeadHtml(docsContentDir: string): string {
    try {
      return readFileSync(path.resolve(docsContentDir, Documints.FILE_NAMES.headHtml), "utf8");
    } catch {
      return "";
    }
  }

  /**
   * Resolves every path a documints project needs, given the `.documints/`
   * directory found in the consuming project.
   */
  private static getDirectories(docsContentDir: string): DocumintsDirs {
    const appShellDir = path.resolve(Documints.getPackageRoot(), "./src/app");
    const serverEntryFile =
      process.env.NODE_ENV === "production"
        ? Documints.FILE_NAMES.staticServerEntry
        : Documints.FILE_NAMES.devServerEntry;

    return {
      projectRootDir: path.dirname(docsContentDir),
      docsContentDir,
      docsPublicDir: path.resolve(docsContentDir, Documints.FILE_NAMES.public),
      headHtml: Documints.readHeadHtml(docsContentDir),
      configFilePath: path.resolve(docsContentDir, Documints.FILE_NAMES.config),
      generatedDir: path.resolve(docsContentDir, Documints.FILE_NAMES.generatedDir),
      orderTypesPath: path.resolve(docsContentDir, Documints.FILE_NAMES.orderTypes),
      appShellDir,
      viteCacheDir: path.resolve(docsContentDir, Documints.FILE_NAMES.viteCacheDir),
      appEntryClientPath: path.resolve(appShellDir, Documints.FILE_NAMES.clientEntry),
      appEntryServerPath: path.resolve(appShellDir, serverEntryFile),
      staticOutputDir: path.resolve(docsContentDir, Documints.FILE_NAMES.staticOutputDir),
      serverBundleDir: path.resolve(docsContentDir, Documints.FILE_NAMES.serverBundleDir)
    };
  }

  /** Walks up from `startDir` (default: cwd) looking for `.documints/config.ts`. */
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

  /** Compiles `.documints/config.ts` with esbuild in-process and validates the result. */
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
      // Return the raw default export, not the parsed result, so non-serializable
      // fields like `vitePlugins` functions survive.
      return mod.default as DocumintsConfig;
    } finally {
      await rm(tempFile, { force: true }).catch(() => undefined);
    }
  }

  /**
   * Scaffolds a new `.documints/` project: a config file, a starter home
   * page, a `.gitignore`, and a stub for the generated order types.
   */
  static async bootstrap(rootDir = process.cwd()): Promise<string> {
    const dotDir = path.resolve(rootDir, CONFIG_DIRNAME);
    const configPath = path.resolve(dotDir, Documints.FILE_NAMES.config);
    const welcomeDocPath = path.resolve(dotDir, Documints.FILE_NAMES.welcomeDoc);
    const gitignorePath = path.resolve(dotDir, Documints.FILE_NAMES.gitignore);
    const orderTypesPath = path.resolve(dotDir, Documints.FILE_NAMES.orderTypes);

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

    await writeFileRecursive(configPath, configContent);
    await writeFileRecursive(welcomeDocPath, welcomeDocContent);
    await writeFileRecursive(gitignorePath, ".vite-cache\n.server-build\nstatic\n.generated\n");
    // config.ts may import defineDocumintsOrdering before any doc has ever
    // been discovered, so there needs to be a real file here from the start.
    await writeFileRecursive(orderTypesPath, Documints.renderOrderTypesFile(""));

    return configPath;
  }

  /**
   * `.generated/order.ts` is gitignored and only ever written by `dev`/`build`,
   * so a fresh clone won't have it yet - but `config.ts` might already import
   * `defineDocumintsOrdering` from it, and that import has to resolve the
   * moment `loadConfig` bundles the file below, before any doc has been
   * discovered to generate the real thing from. Writing an empty stub first
   * (only if nothing's there yet) keeps the import from failing; the real
   * version overwrites it moments later once `dev()`/`build()` runs.
   */
  private static async ensureOrderTypesStub(dotDirPath: string): Promise<void> {
    const orderTypesPath = path.resolve(dotDirPath, Documints.FILE_NAMES.orderTypes);
    const res = await tryHandle(access)(orderTypesPath);
    if (res.success) return;
    await writeFileRecursive(orderTypesPath, Documints.renderOrderTypesFile(""));
  }

  /**
   * Finds and loads `.documints/config.ts` into a `Documints` instance. If
   * none exists, offers to bootstrap one (or does so automatically with
   * `autoInit: true`).
   */
  static async create(options?: { autoInit?: boolean }): Promise<Documints | null> {
    LOG.debug(`Locating the ${CONFIG_DIRNAME}/config.ts file...`);
    const found = await Documints.findConfigFile();

    if (found) {
      LOG.debug(`Found config: ${found.configFile}`);
      await Documints.ensureOrderTypesStub(found.dirPath);
      const config = await Documints.loadConfig(found.configFile);
      const dirs = Documints.getDirectories(found.dirPath);
      return new Documints({ config, dirs });
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
  // methods below them operate on this.#config/#dirs directly
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
   * Resolves any `{ type: "section", title }` header link into a `dropdown`
   * link whose items are that section's child pages. The client only ever
   * sees the resolved shape.
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
   * Turns the route manifest into a nested tree, one level per route-path
   * segment. A segment with no doc of its own (e.g. "introduction" in
   * "guides/introduction/concepts") still gets a node here, marked
   * `synthetic: true` - it exists purely to group its children in the nav.
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

    for (const manifestEntry of Object.values(routeManifest)) {
      addRouteGraphNode(manifestEntry);
    }

    return graphObj;
  }

  /**
   * Turns a doc's frontmatter into its route path. Hierarchy comes from the
   * slash-delimited `title`, not from where the file lives on disk. `home:
   * true` always resolves to "/", regardless of `title`.
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
   * `config.docs`. A file's location on disk has no bearing on its route -
   * only its `title` frontmatter does.
   */
  private getRouteManifest(): DocumintRouteManifest {
    const routeManifest: DocumintRouteManifest = {};

    const pattern = this.#config.docs ?? DEFAULT_DOC_GLOB;
    const matches = globbySync(pattern, {
      cwd: this.#dirs.docsContentDir,
      absolute: true,
      onlyFiles: true,
      ignore: ["**/node_modules/**", "**/.git/**"]
    });

    for (const direntFullPath of matches) {
      // path.relative (not a naive string split) since globby's absolute
      // paths don't necessarily string-match path.resolve()'s output exactly.
      const aliasPath = `/${path.relative(this.#dirs.docsContentDir, direntFullPath).split(path.sep).join("/")}`;

      const frontmatter = Documints.getDocumentConfigFromFrontmatter(aliasPath, direntFullPath);
      const routePath = this.getRoutePathFromFrontmatter(frontmatter);
      const titleSegments = frontmatter.title
        .split("/")
        .map((segment) => segment.trim())
        .filter(Boolean);
      const fileNameFormatted = titleSegments[titleSegments.length - 1] ?? frontmatter.title;
      // The real on-disk filename, not the (possibly `slug`-overridden) URL
      // segment - this is what `order` matches leaf entries against.
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
    return this.orderRouteManifest(routeManifest);
  }

  /**
   * Walks one `order` array (a section's, or a nested group's) and inserts
   * the manifest entries it names into `orderedRouteManifest`, in sequence.
   * A string entry is a leaf, matched by its on-disk filename (more
   * discoverable than its URL slug, which `slug` frontmatter can change). An
   * object entry (`{ [key]: [...] }`) is a nested group matched by its URL
   * segment instead, since a group (like a synthetic "introduction") has no
   * file of its own - and recurses into its own order array.
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
   * given sequence: home page first, then each section's index page and its
   * ordered children, then anything left over in discovery order.
   */
  private orderRouteManifest(routeManifest: DocumintRouteManifest): DocumintRouteManifest {
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

    if (typeof routeIndex === "undefined") {
      throw LOG.fatal(
        new Error(
          'Cannot find a home page. Ensure that one of your .doc.md/.doc.mdx files has "home: true" in its frontmatter.'
        )
      );
    }

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
   * Builds the literal-type union for one level of `order` entries. A real
   * doc is offerable as a plain leaf, by its filename. A synthetic group has
   * no file, so it's never a plain leaf - but any node with children (real
   * or synthetic) is also offerable as `{ "key": [...] }`, recursing into
   * its own children so nested groups can be reordered too.
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
   * Renders `.documints/.generated/order.ts`: a literal-typed `DocumintsOrder`
   * interface plus a `defineDocumintsOrdering` identity function, so
   * `config.ts`'s `order` gets autocomplete and a compile error for a typo'd
   * or stale entry. Regenerated on every route-manifest rebuild.
   */
  private static renderOrderTypesFile(sectionFields: string): string {
    return `// Auto-generated by documints during dev/build - do not edit by hand.
// Regenerates whenever your docs change. If you just added a new section,
// group, or leaf and don't see it here yet, restart \`documints dev\`.

export type DocumintsOrderEntry = string | { [groupKey: string]: DocumintsOrderEntry[] };

export interface DocumintsOrder {
  // Keeps DocumintsOrder assignable to config.ts's "order" field.
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

    await writeFileRecursive(
      this.#dirs.orderTypesPath,
      Documints.renderOrderTypesFile(sectionFields)
    );
  }

  /**
   * The static (non-glob) directory prefix of a glob pattern, e.g.
   * `"../docs/**\/*.doc.{md,mdx,tsx}"` -> `"../docs"`. `config.docs` can
   * point anywhere, including outside `.documints/`, so the dev watcher
   * needs this to know what to actually watch.
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
   * A cheap fingerprint of everything that shapes the nav: each route's path
   * and display label, sorted so it only reflects real changes - not
   * incidental differences in file-discovery order between two runs. Two
   * manifests with the same signature mean nothing nav-visible changed, even
   * if a doc's body content did.
   */
  private static getRouteManifestSignature(routeManifest: DocumintRouteManifest): string {
    const entries = Object.entries(routeManifest)
      .map(([routePath, entry]): [string, string] => [routePath, entry.fileNameFormatted])
      .sort(([a], [b]) => a.localeCompare(b));
    return JSON.stringify(entries);
  }

  private getVirtualModulesPlugin(): VitePlugin {
    let routeManifest = this.getRouteManifest();
    let vModules = this.getVirtualModules(routeManifest);
    const virtualModuleIds = Object.keys(vModules);
    const resolvedVModulePrefix = "\0";

    void this.writeOrderTypesFile(routeManifest).catch((error: unknown) => {
      LOG.warn(`Failed to write .documints/.generated/order.ts: ${error}`);
    });

    return {
      name: "vite-plugin-documints-virtual",
      configureServer: (server) => {
        server.watcher.add(this.#dirs.docsContentDir);
        const docsWatchRoot = path.resolve(
          this.#dirs.docsContentDir,
          Documints.getGlobStaticBase(this.#config.docs ?? DEFAULT_DOC_GLOB)
        );
        server.watcher.add(docsWatchRoot);

        server.watcher.on("all", async (_event, watchedPath) => {
          // Only process doc/config changes - not vite's own cache churn,
          // and not our own generated order.ts, or writing it would
          // re-trigger this handler forever.
          const withinWatchedRoot =
            watchedPath.startsWith(this.#dirs.docsContentDir) ||
            watchedPath.startsWith(docsWatchRoot);
          if (!withinWatchedRoot) return;
          if (watchedPath.startsWith(this.#dirs.viteCacheDir)) return;
          if (watchedPath.startsWith(this.#dirs.generatedDir)) return;

          // config.ts is only ever loaded once, in create() - unlike doc
          // content, nothing else re-reads it, so a saved edit would
          // otherwise keep using whatever was loaded at server startup. Its
          // effects (e.g. header.logo) aren't all captured by the
          // route-manifest signature below, so treat it as always structural.
          const isConfigChange = watchedPath === this.#dirs.configFilePath;
          if (isConfigChange) {
            this.#config = await Documints.loadConfig(this.#dirs.configFilePath);
          }

          const previousSignature = Documints.getRouteManifestSignature(routeManifest);
          routeManifest = this.getRouteManifest();
          const structureChanged =
            isConfigChange ||
            Documints.getRouteManifestSignature(routeManifest) !== previousSignature;

          if (!structureChanged) {
            // Just a doc's own body content (text, JSX, styles) changed.
            // Vite's own HMR already handles that in place; forcing a
            // full-reload here would only replace it with a page flash.
            return;
          }

          LOG.info("Detected route/nav-affecting changes in the docs directory. Reloading...");
          vModules = this.getVirtualModules(routeManifest);
          void this.writeOrderTypesFile(routeManifest).catch((error: unknown) => {
            LOG.warn(`Failed to write .documints/.generated/order.ts: ${error}`);
          });

          const viteVirtualModules = [...server.moduleGraph.idToModuleMap.entries()].filter(
            ([virtualModuleId]) => virtualModuleId.includes("virtual")
          );

          for (const virtualModuleId of virtualModuleIds) {
            const viteVirtualModuleEntry = viteVirtualModules.find(([viteModId]) =>
              viteModId.includes(virtualModuleId)
            );
            if (!viteVirtualModuleEntry) continue;

            const [viteVirtualModuleId] = viteVirtualModuleEntry;
            const viteVirtualModule = server.moduleGraph.getModuleById(viteVirtualModuleId);
            if (!viteVirtualModule) continue;

            server.moduleGraph.invalidateModule(viteVirtualModule);
          }

          server.ws.send({ type: "full-reload" });
        });
      },
      resolveId(id) {
        const vModuleId = virtualModuleIds.find((moduleId) => moduleId === id);
        if (vModuleId) return resolvedVModulePrefix.concat(vModuleId);
        return null;
      },
      load(id) {
        const vModuleId = virtualModuleIds.find(
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
      userDefinedPlugins = this.#config.vitePlugins({
        rootDir: this.#dirs.projectRootDir
      });
    }
    if (Array.isArray(this.#config.vitePlugins)) {
      userDefinedPlugins = this.#config.vitePlugins;
    }

    return defineConfig({
      root: this.#dirs.appShellDir,
      cacheDir: this.#dirs.viteCacheDir,
      publicDir: this.#dirs.docsPublicDir,
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
    // Vite's HMR websocket needs a real http.Server to attach to, or it
    // spins up its own separate one, disconnected from this dev server's port.
    const server = http.createServer(app);

    const vite = await createServer({
      ...viteConfig,
      root: this.#dirs.appShellDir,
      appType: "custom",
      clearScreen: false,
      server: {
        middlewareMode: true,
        hmr: { server }
      }
    });

    app.use(vite.middlewares);

    // No path argument matches every request, since Express 5 dropped the
    // bare "*" wildcard.
    app.use(async (req, res) => {
      const ssrEntryModule = await vite.ssrLoadModule(this.#dirs.appEntryServerPath);
      await handleRequestDev(ssrEntryModule.render, {
        req,
        res,
        dirs: this.#dirs,
        vite,
        head: this.#dirs.headHtml
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
    // build() calls process.exit() right after finishing.
    await this.writeOrderTypesFile(routeManifest);

    try {
      await viteBuild({
        logLevel: "silent",
        root: this.#dirs.appShellDir,
        ...viteConfig,
        build: {
          emptyOutDir: true,
          manifest: true,
          outDir: this.#dirs.staticOutputDir,
          rollupOptions: {
            input: this.#dirs.appEntryClientPath
          }
        }
      });

      await viteBuild({
        logLevel: "silent",
        root: this.#dirs.appShellDir,
        ...viteConfig,
        build: {
          emptyOutDir: true,
          ssr: this.#dirs.appEntryServerPath,
          outDir: this.#dirs.serverBundleDir,
          rollupOptions: {
            output: { entryFileNames: "server.js" }
          }
        }
      });

      const viteManifestPath = path.resolve(this.#dirs.staticOutputDir, "./.vite/manifest.json");
      const viteManifest = JSON.parse(await readFile(viteManifestPath, "utf8"));
      const { render } = await import(
        `${path.resolve(this.#dirs.serverBundleDir, "./server.js")}?t=${Date.now()}`
      );

      for (const entry of Object.values(routeManifest)) {
        const html = await renderRouteToHTML(render, {
          routePath: entry.routePath,
          aliasPath: entry.aliasPath,
          vManifest: viteManifest,
          contentRoot: this.#dirs.docsContentDir,
          viteRoot: this.#dirs.appShellDir,
          head: this.#dirs.headHtml
        });
        const outputPath = path.resolve(
          this.#dirs.staticOutputDir,
          `.${entry.routePath}/index.html`
        );
        await writeFileRecursive(outputPath, html);
      }

      // The SSR bundle was only needed to prerender the routes above - it's
      // never part of the deployed static output.
      await rm(this.#dirs.serverBundleDir, { recursive: true, force: true });

      LOG.checkpointEnd();

      const filesAndDirs = await readdir(this.#dirs.staticOutputDir, {
        recursive: true,
        withFileTypes: true
      });
      const files = filesAndDirs.filter((dirent) => dirent.isFile());
      LOG.success(`Successfully built documentation app!

      Location: ${this.#dirs.staticOutputDir}
      Total Files: ${files.length}
    `);
    } catch (error) {
      throw LOG.fatal(new Error(String(error)));
    }
  }
}
