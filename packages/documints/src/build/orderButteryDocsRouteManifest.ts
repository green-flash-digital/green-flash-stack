import type { ResolvedButteryDocsConfig } from "../config/getButteryDocsConfig.js";
import { LOG } from "../utils/util.logger.js";
import type { ButteryDocsRouteManifest } from "../utils/util.types.js";

/**
 * Reads the config.docs.order configuration and orders the
 * route manifest in accordance with what the user defined in their config.
 *
 * This function will create a new ButteryDocsRouteManifest by looping through
 * the values on config.docs.order and finding each existing manifest's value. It
 * then takes that value and creates a new entry.
 *
 * For all of the items that don't exist on the config, this function will then just loop
 * through all of the items in the existing route manifest and add them if they don't already
 * exist in the ordered route manifest.
 */
export function orderButteryDocsRouteManifest(
  rConfig: ResolvedButteryDocsConfig,
  routeManifest: ButteryDocsRouteManifest
): ButteryDocsRouteManifest {
  // Order the docs
  LOG.debug("Ordering docs...");
  function getRouteManifestEntry(keyWithoutFileExtension: string) {
    if (routeManifest[`${keyWithoutFileExtension}.md`]) {
      return {
        manifestKey: `${keyWithoutFileExtension}.md`,
        manifestEntry: routeManifest[`${keyWithoutFileExtension}.md`],
      };
    }
    return {
      manifestKey: `${keyWithoutFileExtension}.mdx`,
      manifestEntry: routeManifest[`${keyWithoutFileExtension}.mdx`],
    };
  }

  const orderedRouteManifest: ButteryDocsRouteManifest = {};

  // Find the index and set it as the first entry in the new ordered route manifest
  const indexKey = "/_index";
  const { manifestEntry, manifestKey } = getRouteManifestEntry(indexKey);
  orderedRouteManifest[manifestKey] = manifestEntry;

  // Start going through the pages
  for (const page in rConfig.config.order) {
    // find the index of the page and stick it in the ordered route manifest
    const pageIndexKey = `/${page}/_index`;
    const { manifestEntry, manifestKey } = getRouteManifestEntry(pageIndexKey);
    orderedRouteManifest[manifestKey] = manifestEntry;

    // Loop through the rest of th ordered files in the page
    for (const pageDoc of rConfig.config.order[page]) {
      const pageDocKey = `/${page}/${pageDoc}`;
      const { manifestEntry, manifestKey } = getRouteManifestEntry(pageDocKey);
      orderedRouteManifest[manifestKey] = manifestEntry;
    }
  }

  LOG.debug("Ordering docs... done.");
  LOG.debug(`Ordered ${Object.keys(orderedRouteManifest).length} files.`);

  // At this point everything has been ordered that is listed in there so
  // we now need to loop through the route manifest and just add whatever
  // hasn't already been added to the ordered manifest
  for (const [origChunkKey, origChunkValue] of Object.entries(routeManifest)) {
    // Don't add the route chunk if it's already added
    if (orderedRouteManifest[origChunkKey]) continue;
    // Add the route chunk
    orderedRouteManifest[origChunkKey] = origChunkValue;
  }

  return orderedRouteManifest;
}
