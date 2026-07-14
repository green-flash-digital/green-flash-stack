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
export function getRouteAssets(
  routeId: string,
  vManifest: Manifest,
  contentRoot: string,
  viteRoot: string
) {
  // match the vite chunks with the documint's route
  const { viteChunkEntry, viteChunkRoute } = getCriticalViteChunks(
    routeId,
    vManifest,
    contentRoot,
    viteRoot
  );

  // The entry chunk's own CSS (design tokens, the self-hosted font, shell
  // component styles) is always needed - but a route can have its own CSS
  // too (e.g. index.doc.tsx's own `css` tags land in their own chunk, not
  // the entry's), which was being silently dropped since only the entry's
  // css array was ever collected. Walking the route's full import tree -
  // same as the js collection below - picks that up too.
  const cssSet = new Set<string>(viteChunkEntry.css ?? []);

  // recursively collect the js scripts (and any css alongside them) by
  // checking the imports of the file
  const scriptsSet = new Set<string>();
  function collectAssets(manifestEntry: ManifestChunk) {
    for (const cssFile of manifestEntry.css ?? []) {
      cssSet.add(cssFile);
    }
    for (const importScript of manifestEntry.imports ?? []) {
      scriptsSet.add(vManifest[importScript].file);
      collectAssets(vManifest[importScript]);
    }
  }
  collectAssets(viteChunkRoute);
  scriptsSet.add(viteChunkRoute.file);
  const jsAssets = [...scriptsSet.values()];

  return {
    cssAssets: [...cssSet.values()],
    jsAssets
  };
}
