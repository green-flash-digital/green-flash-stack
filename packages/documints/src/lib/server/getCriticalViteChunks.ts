import type { Manifest, ManifestChunk } from "vite";

/**
 * Fetches the vite manifest entry that matches the supplied route ID. Note that
 * the route ID is reconciled using the `getButteryRouteFromRequest`.
 * First normalize the key to match the relative path to the .buttery/docs
 * folder. From there we can loop through the viteManifest and fine the route
 * in the buttery manifest that matches the key of the vite manifest
 */
export function getCriticalViteChunks(routeId: string, vManifest: Manifest) {
  const viteChunkRoute = Object.entries(vManifest).reduce<
    ManifestChunk | undefined
  >((accum, [entryKey, entryValue]) => {
    const normalizedKey = entryKey.split(".buttery/docs")[1];
    if (normalizedKey === routeId) {
      return entryValue;
    }
    return accum;
  }, undefined);

  if (!viteChunkRoute) {
    throw `Could not locate a vite route chunk entry that matches the routeId: ${routeId}`;
  }

  // loop through the viteManifest to get the manifest entry
  // that is the entry to the app. This allows us to find the CSS
  // that was bundled to the app.
  const entryKey = Object.entries(vManifest).reduce<string | undefined>(
    (accum, [entryKey, entryValue]) => {
      if (entryValue.isEntry) {
        return entryKey;
      }
      return accum;
    },
    undefined
  );

  if (!entryKey) {
    throw "Cannot locate an base entry in the manifest. This should not have happened.";
  }

  return {
    viteChunkRoute,
    viteChunkEntry: vManifest[entryKey],
  };
}
