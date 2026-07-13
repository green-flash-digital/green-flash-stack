import type { JSX } from "react";

export type DocumintRouteManifestEntry = {
  routePath: string;
  fileName: string;
  fileNameFormatted: string;
  aliasPath: string;
  /**
   * Absolute, fully-resolved filesystem path to the doc file. Used to build
   * the generated `import()` specifier instead of `aliasPath` - a doc file
   * living outside `srcDocs.root` (the common case, e.g. a sibling `docs/`
   * folder) makes `aliasPath` contain a literal, unresolved `../` segment
   * once concatenated onto the `@docs` alias, which glob-based plugin filters
   * (like `wyw`'s) silently fail to match since `..` reads as a dotfile
   * segment. An absolute path has no such segment.
   */
  fullPath: string;
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
