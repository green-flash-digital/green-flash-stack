import type { JSX } from "react";

export type DocumintRouteManifestEntry = {
  routePath: string;
  fileName: string;
  fileNameFormatted: string;
  aliasPath: string;
  root: boolean;
};
export type DocumintRouteManifestEntryDoc = DocumintRouteManifestEntry & {
  importComponent: () => Promise<{
    default: JSX.ElementType;
    tableOfContents: { value: string; depth: number }[];
    frontmatter: Record<string, unknown>;
  }>;
};
export type DocumintRouteManifest = {
  [routeId: string]: DocumintRouteManifestEntry;
};
export type DocumintRouteManifestGraphObject = {
  [key: string]: DocumintRouteManifestEntry & {
    pages: DocumintRouteManifestGraphObject;
  };
};
