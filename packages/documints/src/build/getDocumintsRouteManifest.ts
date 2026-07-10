import path from "node:path";

import { globbySync } from "globby";
import { printAsBullets } from "logarhythm";

import type { ResolvedDocumintsConfig } from "../Documints.js";
import { LOG } from "../utils/util.logger.js";
import type { ButteryDocsRouteManifest } from "../utils/util.types.js";
import {
  type DocumintsFrontmatter,
  getDocumentConfigFromFrontmatter
} from "./getDocumentConfigFromFrontmatter.js";
import { orderDocumintsRouteManifest } from "./orderDocumintsRouteManifest.js";

/**
 * Default glob, resolved relative to `.documints/`. Matches the same files
 * the old fixed-directory walk did: any `.doc.md`/`.doc.mdx` file, anywhere
 * under `.documints/content/`. Override via `config.docs` to search
 * somewhere else entirely - see `documintsConfigSchema`.
 */
const DEFAULT_DOC_GLOB = "./content/**/*.doc.{md,mdx}";

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Turns a doc's frontmatter into its route path. Hierarchy comes from the
 * slash-delimited `title` (Storybook-style), not from where the file lives on
 * disk. `home: true` always resolves to "/" regardless of `title`, since the
 * home page sits outside the nav tree.
 */
function getRoutePathFromFrontmatter(frontmatter: DocumintsFrontmatter): string {
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
 * Discovers every `.doc.md`/`.doc.mdx` file matching `config.docs` (or the
 * default glob), wherever it's nested. Unlike the filesystem-driven routing
 * this replaces, a file's location on disk has no bearing on its route — only
 * its `title` frontmatter does.
 */
export function getDocumintsRouteManifest(
  rConfig: ResolvedDocumintsConfig
): ButteryDocsRouteManifest {
  const routeManifest: ButteryDocsRouteManifest = {};

  const pattern = rConfig.config.docs ?? DEFAULT_DOC_GLOB;
  LOG.debug(`Discovering docs matching "${pattern}" (from "${rConfig.dirs.srcDocs.root}")...`);
  const matches = globbySync(pattern, {
    cwd: rConfig.dirs.srcDocs.root,
    absolute: true,
    onlyFiles: true,
    ignore: ["**/node_modules/**", "**/.git/**"]
  });

  for (const direntFullPath of matches) {
    // path.relative (not a naive string split) since globby's absolute paths
    // don't necessarily string-match path.resolve()'s output exactly.
    const aliasPath = `/${path.relative(rConfig.dirs.srcDocs.root, direntFullPath).split(path.sep).join("/")}`;
    LOG.debug(`Creating manifest entry for doc: ${aliasPath}`);

    const frontmatter = getDocumentConfigFromFrontmatter(aliasPath, direntFullPath);
    const routePath = getRoutePathFromFrontmatter(frontmatter);
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

  return orderDocumintsRouteManifest(rConfig, routeManifest);
}
