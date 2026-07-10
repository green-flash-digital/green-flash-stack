import type {
  ButteryDocsRouteManifest,
  ButteryDocsRouteManifestGraphObject,
  ButteryDocsRouteManifestEntry,
} from "../lib/index.js";
import { LOG } from "../utils/util.logger.js";

/**
 * Takes the route manifest and recursively turns it into a graphical
 * representation of the routes. For instance if the route path is
 * /commands/getting-started/reference, this function will split the path
 * and create a nested graph of those segments such as `commands.pages.getting-started.pages.reference`.
 *
 * This function is created to automatically adapt to any additions to the route manifest. There is
 * no code in this function that will add any properties or delete any. Instead it's only
 * purpose is to read the route segments and create a nested graph of them. This
 * is done intentionally so that the route manifest is the central brain to a lot of the data
 * that is needed to make routing and the things around them as clean as possible as well
 * as provide the ability to scale the manifest as needed.
 */
export type ButteryDocsRouteManifestGraph = ReturnType<
  typeof getButteryDocsRouteGraph
>;
export function getButteryDocsRouteGraph(
  routeManifest: ButteryDocsRouteManifest
) {
  const graphObj: ButteryDocsRouteManifestGraphObject = {};

  function addRouteGraphNode(manifestEntry: ButteryDocsRouteManifestEntry) {
    const manifestEntrySegments = manifestEntry.routePath
      .split("/")
      .filter(Boolean);

    let currentGraphObj = graphObj;

    for (const segmentIndex in manifestEntrySegments) {
      const i = Number(segmentIndex);
      const segment = manifestEntrySegments[segmentIndex];
      if (!currentGraphObj[segment]) {
        LOG.debug(`Segment "${segment}" doesn't exist. Creating nested graph.`);
        currentGraphObj[segment] = {
          aliasPath: "",
          fileName: "",
          fileNameFormatted: "",
          root: false,
          routePath: "",
          pages: {},
        };
      }

      // this ensures the contents of the segment are put
      // in the correct place and not in the parent. There
      if (i === manifestEntrySegments.length - 1) {
        currentGraphObj[segment] = {
          ...manifestEntry,
          pages: currentGraphObj[segment].pages,
        };
      } else {
        currentGraphObj = currentGraphObj[segment].pages;
      }
    }
  }

  // Get all of the values (GraphEntires) of the manifest
  // and loop through them figure out where they should go
  const manifestEntries = Object.values(routeManifest);
  for (const manifestEntry of manifestEntries) {
    LOG.debug(`Adding "${manifestEntry.routePath}" to the route graph...`);
    addRouteGraphNode(manifestEntry);
    LOG.debug(
      `Adding "${manifestEntry.routePath}" to the route graph... done.`
    );
  }

  return graphObj;
}
