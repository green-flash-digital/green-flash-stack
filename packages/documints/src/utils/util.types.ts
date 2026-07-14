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
  /**
   * True when this graph node exists only to hold a title-path segment that
   * no doc's `title` resolves to exactly (e.g. the "Introduction" in
   * "Guides/Introduction/What Is Documints" when no doc's title is just
   * "Guides/Introduction"). Synthetic nodes have no `routePath`/page of their
   * own - the nav renders them as a plain group label, not a link.
   */
  synthetic: boolean;
  /**
   * A direct link to edit this doc's source at its host (e.g. GitHub),
   * precomputed from `config.editUrl` - `undefined` if that's not
   * configured, or for a synthetic node with no doc backing it.
   */
  editHref?: string;
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
