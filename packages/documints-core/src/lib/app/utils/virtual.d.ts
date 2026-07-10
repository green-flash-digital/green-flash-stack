declare module "virtual:routes" {
  import type {
    ButteryDocsRouteManifestGraphObject,
    ButteryDocsRouteManifestEntryDoc
  } from "../../../utils/util.types.js";
  // Adjust the types based on what your `virtual:routes` module exports
  export const routeGraph: ButteryDocsRouteManifestGraphObject;
  export const routeDocs: ButteryDocsRouteManifestEntryDoc[];
  export const routeIndex: ButteryDocsRouteManifestEntryDoc;
}

declare module "virtual:data" {
  import type { ButteryDocsResolvedHeader } from "../../../config/_config.utils.js";
  export const header: ButteryDocsResolvedHeader | undefined;
}

declare module "*.css" {
  const content: string;
  export default content;
}
