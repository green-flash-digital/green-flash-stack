/**
 * A minimal stand-in for the (now-deleted) `@buttery/meta` package: collects
 * a page's `<title>` during render so it can be rendered into the SSR HTML
 * shell's `<head>`. Intentionally small - just enough for the title tag that
 * documints' current frontmatter (`title`) provides.
 */
export class DocumintsMeta {
  title = "";

  setTitle(title: string) {
    this.title = title;
  }

  renderNodesToString(): string {
    return this.title ? `<title>${this.title}</title>` : "";
  }
}
