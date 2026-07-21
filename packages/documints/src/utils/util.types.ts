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
  /**
   * This route's raw source, served as plain Markdown at `<routePath>.md` -
   * `undefined` for a `.doc.tsx` page, which has no raw-Markdown equivalent.
   */
  markdownHref?: string;
  /**
   * This route's structured metadata, always served at `<routePath>.json` -
   * unlike `markdownHref`, every route has one (including `.doc.tsx` pages).
   */
  jsonHref: string;
  /** The real, on-disk file type this route was authored as - drives `markdownHref`/`jsonHref` content. */
  sourceType: "md" | "mdx" | "tsx";
  /**
   * Optional one-line summary from frontmatter - feeds `llms.txt`,
   * `docs-manifest.json`, and each route's own `.json`. `undefined` for a
   * synthetic node, or a doc that didn't set one.
   */
  description?: string;
  /**
   * Route paths of other docs worth reading alongside this one, from
   * frontmatter - anything the route graph can't already derive on its own.
   */
  related?: string[];
  /** Route paths a reader should understand before this one, from frontmatter. */
  prerequisites?: string[];
};

/** A flattened table-of-contents entry - see `DocumintsMeta.setTableOfContents`. */
export type DocumintHeading = {
  id: string;
  text: string;
  level: number;
};

export const DOCUMINTS_MANIFEST_SCHEMA_VERSION = "1";

export type DocumintsManifestDocument = {
  title: string;
  path: string;
  sourceType: "md" | "mdx" | "tsx";
  /** URL of this route's `.md` sibling - `undefined` for a `.doc.tsx` page. */
  markdown?: string;
  description?: string;
  /** First path segment (e.g. "guides") - `undefined` for the home page. */
  section?: string;
  /**
   * The nearest real-document ancestor's path, skipping past synthetic
   * grouping segments (e.g. "Introduction") that have no page of their own -
   * `undefined` for the home page and top-level section index pages.
   */
  parent?: string;
  /**
   * The nearest real-document descendants' paths, same synthetic-skipping
   * rule as `parent` - a doc with only synthetic children reports its
   * grandchildren instead, never a path with no real page behind it.
   */
  children?: string[];
  /** Route paths of other docs worth reading alongside this one - see `DocumintsFrontmatter.related`. */
  related?: string[];
  /** Route paths a reader should understand before this one. */
  prerequisites?: string[];
};

export type DocumintsManifest = {
  schemaVersion: typeof DOCUMINTS_MANIFEST_SCHEMA_VERSION;
  title?: string;
  siteUrl?: string;
  documents: DocumintsManifestDocument[];
};

export type DocumintsDocumentJson = {
  schemaVersion: typeof DOCUMINTS_MANIFEST_SCHEMA_VERSION;
  title: string;
  path: string;
  sourceType: "md" | "mdx" | "tsx";
  /** URL of this route's `.md` sibling - `undefined` for a `.doc.tsx` page. */
  markdown?: string;
  description?: string;
  related?: string[];
  prerequisites?: string[];
  headings: DocumintHeading[];
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
