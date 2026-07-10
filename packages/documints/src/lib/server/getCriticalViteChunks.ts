import type { Manifest, ManifestChunk } from "vite";

/**
 * Fetches the vite manifest entry that matches the supplied route ID (a doc's
 * `aliasPath`, relative to the content root). Vite's manifest keys are the
 * resolved absolute disk paths, so we normalize each key by stripping
 * everything up to and including `contentRoot` (an absolute path) to compare
 * against the manifest's own aliasPath-relative keys.
 */
export function getCriticalViteChunks(
  routeId: string,
  vManifest: Manifest,
  contentRoot: string
) {
  const viteChunkRoute = Object.entries(vManifest).reduce<
    ManifestChunk | undefined
  >((accum, [entryKey, entryValue]) => {
    const normalizedKey = entryKey.split(contentRoot)[1];
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
