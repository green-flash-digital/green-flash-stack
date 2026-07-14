import type { Manifest, ManifestChunk } from "vite";

import { getCriticalViteChunks, getEntryViteChunk } from "./getCriticalViteChunks.js";

function collectChunkAssets(vManifest: Manifest, entryChunk: ManifestChunk) {
  const cssSet = new Set<string>();
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
  collectAssets(entryChunk);
  scriptsSet.add(entryChunk.file);

  return { cssAssets: [...cssSet.values()], jsAssets: [...scriptsSet.values()] };
}

/**
 * For a route with no doc file backing it (e.g. the 404 page - it's part of
 * the eager entry bundle, not a lazily `import()`ed doc), there's no
 * per-route chunk to look up at all. Its assets are already covered
 * entirely by the entry chunk's own (recursively collected) css/js.
 */
export function getEntryOnlyAssets(vManifest: Manifest) {
  return collectChunkAssets(vManifest, getEntryViteChunk(vManifest));
}

/**
 * Provided the reconciled route id from the request, finds the vite chunk
 * that matches that route plus the app's own entry chunk, and merges the
 * (recursively collected) css/js of both - a route's own chunk normally
 * imports the entry chunk anyway (so this is often redundant in practice),
 * but merging both explicitly means a route's assets are never silently
 * incomplete if that ever isn't true.
 */
export function getRouteAssets(
  routeId: string,
  vManifest: Manifest,
  contentRoot: string,
  viteRoot: string
) {
  const { viteChunkEntry, viteChunkRoute } = getCriticalViteChunks(
    routeId,
    vManifest,
    contentRoot,
    viteRoot
  );

  const entryAssets = collectChunkAssets(vManifest, viteChunkEntry);
  const routeAssets = collectChunkAssets(vManifest, viteChunkRoute);

  return {
    cssAssets: [...new Set([...entryAssets.cssAssets, ...routeAssets.cssAssets])],
    jsAssets: [...new Set([...entryAssets.jsAssets, ...routeAssets.jsAssets])]
  };
}
