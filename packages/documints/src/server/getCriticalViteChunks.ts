import path from "node:path";

import type { Manifest, ManifestChunk } from "vite";

/**
 * Fetches the vite manifest entry that matches the supplied route ID (a doc's
 * `aliasPath`, relative to the content root). Vite manifest keys are paths
 * *relative to vite's project root* (`app/`), not absolute paths, so we
 * resolve each key against `viteRoot` and compare against the doc's own
 * resolved absolute path instead of trying to string-match.
 */
/**
 * The manifest entry for the app's own eager entry point (`entry.client.tsx`)
 * - covers the shell (Layout, header, nav) and anything else that isn't
 * behind a lazy `import()`, e.g. NotFoundPage.
 */
export function getEntryViteChunk(vManifest: Manifest): ManifestChunk {
  const entryKey = Object.entries(vManifest).find(([, entryValue]) => entryValue.isEntry)?.[0];

  if (!entryKey) {
    throw "Cannot locate an base entry in the manifest. This should not have happened.";
  }

  return vManifest[entryKey];
}

export function getCriticalViteChunks(
  routeId: string,
  vManifest: Manifest,
  contentRoot: string,
  viteRoot: string
) {
  const targetPath = path.resolve(contentRoot, `.${routeId}`);

  const viteChunkRoute = Object.entries(vManifest).reduce<ManifestChunk | undefined>(
    (accum, [entryKey, entryValue]) => {
      if (path.resolve(viteRoot, entryKey) === targetPath) {
        return entryValue;
      }
      return accum;
    },
    undefined
  );

  if (!viteChunkRoute) {
    throw `Could not locate a vite route chunk entry that matches the routeId: ${routeId}`;
  }

  return {
    viteChunkRoute,
    viteChunkEntry: getEntryViteChunk(vManifest)
  };
}
