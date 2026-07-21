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
  import type { DocumintResolvedHeader } from "../../config/config.utils.js";
  export const header: DocumintResolvedHeader | undefined;
  export const buildYear: number;
}

declare module "*.css" {
  const content: string;
  export default content;
}

// No official types ship with this package - only the surface documints
// actually uses is declared here, not the full options object.
declare module "@pagefind/default-ui" {
  export class PagefindUI {
    constructor(options: {
      element: string | HTMLElement;
      showSubResults?: boolean;
      showImages?: boolean;
      resetStyles?: boolean;
      autofocus?: boolean;
    });
    destroy(): void;
  }
}
