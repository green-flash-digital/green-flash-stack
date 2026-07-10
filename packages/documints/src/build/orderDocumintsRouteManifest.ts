import type { ResolvedDocumintsConfig } from "../Documints.js";
import { LOG } from "../utils/util.logger.js";
import type { ButteryDocsRouteManifest } from "../utils/util.types.js";

/**
 * Reads `config.order` and re-inserts entries into a new manifest in the
 * desired sequence: the home page first, then each configured section's index
 * page followed by its pages in the order given, then anything left over in
 * whatever order it was discovered. The manifest is keyed by route path, so
 * `order` is expressed the same way: section keys and leaf slugs, not files.
 */
export function orderDocumintsRouteManifest(
  rConfig: ResolvedDocumintsConfig,
  routeManifest: ButteryDocsRouteManifest
): ButteryDocsRouteManifest {
  LOG.debug("Ordering docs...");
  const orderedRouteManifest: ButteryDocsRouteManifest = {};

  const homeEntry = routeManifest["/"];
  if (homeEntry) orderedRouteManifest["/"] = homeEntry;

  for (const section in rConfig.config.order) {
    const sectionIndexPath = `/${section}`;
    if (routeManifest[sectionIndexPath]) {
      orderedRouteManifest[sectionIndexPath] = routeManifest[sectionIndexPath];
    }

    for (const leafSlug of rConfig.config.order[section]) {
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
