import type { ButteryDocsRouteManifest } from "../../utils/util.types.js";

/**
 * Fetches the buttery route manifest entry that matches the requested pathname
 */
export function getButteryRouteIdFromRequest(
  pathname: string,
  bManifest: ButteryDocsRouteManifest
) {
  // Match the routeId to the pathname
  const butteryRouteId = Object.entries(bManifest).reduce<string | undefined>(
    (accum, [entryKey, entryValue]) => {
      if (entryValue.routePath === pathname) {
        return entryKey;
      }
      return accum;
    },
    undefined
  );

  if (!butteryRouteId) {
    throw `Cannot locate a route entry that matches ${pathname}`;
  }
  return butteryRouteId;
}
