import { type Dirent, readdirSync } from "node:fs";
import path from "node:path";

import { printAsBullets } from "logarhythm";

import type { ResolvedDocumintsConfig } from "../Documints.js";
import { LOG } from "../utils/util.logger.js";
import type { ButteryDocsRouteManifest } from "../utils/util.types.js";
import {
  type DocumintsFrontmatter,
  getDocumentConfigFromFrontmatter
} from "./getDocumentConfigFromFrontmatter.js";
import { orderDocumintsRouteManifest } from "./orderDocumintsRouteManifest.js";

const DOC_FILE_PATTERN = /\.doc\.mdx?$/;

const shouldReadDirectory = (dirent: Dirent): boolean => {
  return !dirent.name.startsWith(".") && dirent.name !== "_public";
};

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
 * Recursively walks the docs content directory and discovers every `*.doc.md` /
 * `*.doc.mdx` file, wherever it's nested. Unlike the filesystem-driven routing
 * this replaces, a file's location on disk has no bearing on its route — only
 * its `title` frontmatter does.
 */
export function getDocumintsRouteManifest(
  rConfig: ResolvedDocumintsConfig
): ButteryDocsRouteManifest {
  const routeManifest: ButteryDocsRouteManifest = {};

  function discoverDocs(dir: string) {
    const dirents = readdirSync(dir, { withFileTypes: true });

    for (const dirent of dirents) {
      const direntFullPath = path.resolve(dirent.parentPath, dirent.name);

      if (dirent.isDirectory() && shouldReadDirectory(dirent)) {
        LOG.debug(`Reading directory "${dirent.name}" for .doc files...`);
        discoverDocs(direntFullPath);
        continue;
      }

      if (!dirent.isFile() || !DOC_FILE_PATTERN.test(dirent.name)) continue;

      const aliasPath = direntFullPath.split(rConfig.dirs.srcDocs.root)[1];
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
  }

  discoverDocs(rConfig.dirs.srcDocs.root);

  if (!rConfig.config.order) return routeManifest;
  LOG.debug("Detected an order to the docs... ordering the manifest.");

  return orderDocumintsRouteManifest(rConfig, routeManifest);
}
