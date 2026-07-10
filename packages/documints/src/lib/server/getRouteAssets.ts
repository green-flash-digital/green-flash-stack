import type { Manifest, ManifestChunk } from "vite";

import { getCriticalViteChunks } from "./getCriticalViteChunks.js";

/**
 * Provided the reconciled route id from the request, this function
 * will find the vite chunk in the vite manifest that matches the route
 * as well as finds the entry chunk that vite creates for the client.
 *
 * Based upon those two chunks, we can gather the CSS and JS scripts by
 * returning the .css path on the entry chunk and then recursively fetching
 * all of the imports for each nested vite chunk import.
 */
export function getRouteAssets(routeId: string, vManifest: Manifest) {
  // match the vite chunks with the buttery route
  const { viteChunkEntry, viteChunkRoute } = getCriticalViteChunks(
    routeId,
    vManifest
  );

  // gather css
  const cssAssets = viteChunkEntry.css ?? [];

  // recursively collect the js scripts by checking the imports
  // of the file
  const scriptsSet = new Set<string>();
  function collectScripts(manifestEntry: ManifestChunk) {
    for (const importScript of manifestEntry.imports ?? []) {
      scriptsSet.add(vManifest[importScript].file);
      collectScripts(vManifest[importScript]);
    }
  }
  collectScripts(viteChunkRoute);
  scriptsSet.add(viteChunkRoute.file);
  const jsAssets = [...scriptsSet.values()];

  return {
    cssAssets,
    jsAssets,
  };
}
