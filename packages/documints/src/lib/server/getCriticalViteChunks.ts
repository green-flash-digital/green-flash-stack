import path from "node:path";

import type { Manifest, ManifestChunk } from "vite";

/**
 * Fetches the vite manifest entry that matches the supplied route ID (a doc's
 * `aliasPath`, relative to the content root). Vite manifest keys are paths
 * *relative to vite's project root* (`app/`), not absolute paths, so we
 * resolve each key against `viteRoot` and compare against the doc's own
 * resolved absolute path instead of trying to string-match.
 */
export function getCriticalViteChunks(
  routeId: string,
  vManifest: Manifest,
  contentRoot: string,
  viteRoot: string
) {
  const targetPath = path.resolve(contentRoot, `.${routeId}`);

  const viteChunkRoute = Object.entries(vManifest).reduce<
    ManifestChunk | undefined
  >((accum, [entryKey, entryValue]) => {
    if (path.resolve(viteRoot, entryKey) === targetPath) {
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
