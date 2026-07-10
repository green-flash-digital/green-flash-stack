import type { JSX } from "react";

export type ButteryDocsRouteManifestEntry = {
  routePath: string;
  fileName: string;
  fileNameFormatted: string;
  aliasPath: string;
  root: boolean;
};
export type ButteryDocsRouteManifestEntryDoc = ButteryDocsRouteManifestEntry & {
  importComponent: () => Promise<{
    default: JSX.ElementType;
    tableOfContents: { value: string; depth: number }[];
    frontmatter: Record<string, unknown>;
  }>;
};
export type ButteryDocsRouteManifest = {
  [routeId: string]: ButteryDocsRouteManifestEntry;
};
export type ButteryDocsRouteManifestGraphObject = {
  [key: string]: ButteryDocsRouteManifestEntry & {
    pages: ButteryDocsRouteManifestGraphObject;
  };
};
