declare module "virtual:routes" {
  import type {
    DocumintRouteManifestGraphObject,
    DocumintRouteManifestEntryDoc
  } from "@documints/core";
  // Adjust the types based on what your `virtual:routes` module exports
  export const routeGraph: DocumintRouteManifestGraphObject;
  export const routeDocs: DocumintRouteManifestEntryDoc[];
  export const routeIndex: DocumintRouteManifestEntryDoc;
}

declare module "virtual:data" {
  import type { DocumintResolvedHeader } from "@documints/core";
  export const header: DocumintResolvedHeader | undefined;
}

declare module "*.css" {
  const content: string;
  export default content;
}
