/// <reference types="vite/client" />

declare module "virtual:routes" {
  import type {
    DocumintRouteManifestGraphObject,
    DocumintRouteManifestEntryDoc
  } from "../../utils/util.types.js";
  // Adjust the types based on what your `virtual:routes` module exports
  export const routeGraph: DocumintRouteManifestGraphObject;
  export const routeDocs: DocumintRouteManifestEntryDoc[];
  export const routeIndex: DocumintRouteManifestEntryDoc;
}

declare module "virtual:data" {
  import type { DocumintResolvedHeader } from "../../config/_config.utils.js";
  export const header: DocumintResolvedHeader | undefined;
}

declare module "*.css" {
  const content: string;
  export default content;
}
