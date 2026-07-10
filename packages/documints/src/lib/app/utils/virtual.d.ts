declare module "virtual:routes" {
  import type {
    ButteryDocsRouteManifestGraphObject,
    ButteryDocsRouteManifestEntryDoc,
  } from "@buttery/core/config";
  // Adjust the types based on what your `virtual:routes` module exports
  export const routeGraph: ButteryDocsRouteManifestGraphObject;
  export const routeDocs: ButteryDocsRouteManifestEntryDoc[];
  export const routeIndex: ButteryDocsRouteManifestEntryDoc;
}

declare module "virtual:data" {
  import type { ButteryConfigDocs } from "@buttery/core/config";
  export const header: ButteryConfigDocs["header"];
}
