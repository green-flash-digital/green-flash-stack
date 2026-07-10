
import path from "node:path";
import { type Dirent, readdirSync } from "node:fs";

import { printAsBullets } from "@buttery/logs";

import { getDocumentConfigFromFrontmatter } from "./getDocumentConfigFromFrontmatter.js";
import { orderButteryDocsRouteManifest } from "./orderButteryDocsRouteManifest.js";

import type { ResolvedButteryDocsConfig } from "../config/getButteryDocsConfig.js";
import { LOG } from "../utils/util.logger.js";
import type { ButteryDocsRouteManifest } from "../utils/util.types.js";

const shouldReadDirectory = (dirent: Dirent): boolean => {
  // TODO: Figure out what level the dirent is in relation to the root directory
  // TODO: V2 - Outside of a few reserved directories, let the user decide which patterns
  // they want excluded
  return !dirent.name.startsWith("_") && dirent.name !== "dist";
};

function getPageSegmentsFromRouteId(routeId: string) {
  const pageNameRegEx = /^\/([^/]+)\//;
  const match = routeId.match(pageNameRegEx);
  const pageName = match?.[1];
  return pageName ? [pageName] : [];
}

function getRouteSegmentsFromRouteId(routeId: string) {
  const routeExtension = path.extname(routeId);
  const routeFilepath = routeId.split(routeExtension)[0];
  const routeSegmentArr = routeFilepath.split("/");
  const routeSegments =
    routeSegmentArr[routeFilepath.split("/").length - 1].split(".");
  LOG.debug(
    `Getting route segments from route filepath: ${routeFilepath}${printAsBullets(
      routeSegments
    )}`
  );
  return routeSegments;
}

function getRoutePathFromRouteId(routeId: string): string {
  const pageSegments = getPageSegmentsFromRouteId(routeId);
  const routeSegments = getRouteSegmentsFromRouteId(routeId);
  const segments = pageSegments
    .concat(routeSegments)
    .filter((segment) => segment !== "_index");
  return `/${segments.join("/")}`;
}

/**
 * Recursively reads the directories and files inside of the .buttery/docs
 * directory and creates a manifest in which files can be referenced and
 * dynamically imported.
 */
export function getButteryDocsRouteManifest(
  rConfig: ResolvedButteryDocsConfig
): ButteryDocsRouteManifest {
  const routeManifest: ButteryDocsRouteManifest = {};

  // Recursively read each directory in the docs to
  // create route manifest entries
  function createRoutes(dir: string) {
    // read the directory and return the Dirent object
    const dirents = readdirSync(dir, { withFileTypes: true });

    for (const dirent of dirents) {
      const direntFullPath = path.resolve(dirent.parentPath, dirent.name);

      // Recursively read the nested directories in the .buttery/docs folder.
      // that aren't pre-determined to be ignored.
      //
      // Note that since we're only specifying one level deep so we need
      // to track to make sure that we don't include any folders that
      // the user nested below 1 level in the docs.
      //
      // The rationale for making this recursive is that at some-point in the future
      // there might be a need to expand the routing conventions into something more
      // complex and I felt it better to adapt a recursive function than a simple reduction
      if (dirent.isDirectory() && shouldReadDirectory(dirent)) {
        LOG.debug(`Detected page "${dirent.name}". Reading page directory...`);
        createRoutes(direntFullPath);
      }

      // If the dirent is a file, let's go ahead and process it
      // and create a manifest entry
      if (dirent.isFile()) {
        const routeId = direntFullPath.split(rConfig.dirs.srcDocs.root)[1];
        LOG.debug(`Creating manifest for route: ${routeId}`);
        const aliasPath = routeId;
        const routePath = getRoutePathFromRouteId(routeId);
        const docConfig = getDocumentConfigFromFrontmatter(
          routeId,
          direntFullPath
        );
        const routeSegments = routePath.split("/");
        const fileName = routeSegments[routeSegments.length - 1];
        const fileNameFormatted =
          docConfig.config.navBarDisplay || fileName.replaceAll("-", " ");
        const isRoot = routeId.startsWith("/_index");

        routeManifest[routeId] = {
          aliasPath,
          fileName,
          fileNameFormatted,
          routePath,
          root: isRoot,
        };
      }
    }
  }

  createRoutes(rConfig.dirs.srcDocs.root);

  if (!rConfig.config.order) return routeManifest;
  LOG.debug("Detected an order to the docs... ordering the manifest.");

  return orderButteryDocsRouteManifest(rConfig, routeManifest);
}
