import { useEffect } from "react";

import type { Toc } from "@stefanprobst/rehype-extract-toc";

import { useDocumintsMeta } from "../../meta/DocumintsMeta.provider.js";

/**
 * Rendered once per page (typically from the page's frontmatter) to set the
 * document title. Sets it directly during render for SSR string collection,
 * and via an effect for client-side navigations.
 *
 * Also carries `tableOfContents` (when the route has one - `.doc.tsx` pages
 * don't) purely so `Documints.build()` can read it back off `Meta` after
 * render, for that route's `.json` sibling - see `DocumintsMeta`.
 */
export function DocumintsMetaComponent({
  title,
  tableOfContents
}: {
  title?: string;
  tableOfContents?: Toc;
}) {
  const meta = useDocumintsMeta();
  meta.setTitle(title ?? "");
  meta.setTableOfContents(tableOfContents);

  useEffect(() => {
    if (typeof document !== "undefined" && title) {
      document.title = title;
    }
  }, [title]);

  return null;
}
