import type { Toc } from "@stefanprobst/rehype-extract-toc";

/**
 * A minimal stand-in for the (now-deleted) `@buttery/meta` package: collects
 * a page's `<title>` during render so it can be rendered into the SSR HTML
 * shell's `<head>`. Intentionally small - just enough for the title tag that
 * documints' current frontmatter (`title`) provides.
 *
 * Also doubles as the capture point for a route's `tableOfContents` (see
 * `DocumintsMetaComponent`) - the only way to get that data, which lives
 * inside the compiled MDX module, back out to `Documints.build()`'s Node-side
 * code without a second parse: it's set here during the same SSR render pass
 * `build()` already does, then read back off this instance afterward.
 */
export class DocumintsMeta {
  title = "";
  tableOfContents: Toc | null = null;

  setTitle(title: string) {
    this.title = title;
  }

  setTableOfContents(tableOfContents: Toc | null | undefined) {
    this.tableOfContents = tableOfContents ?? null;
  }

  renderNodesToString(): string {
    return this.title ? `<title>${this.title}</title>` : "";
  }
}
