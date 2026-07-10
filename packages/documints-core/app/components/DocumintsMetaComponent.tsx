import { useEffect } from "react";

import { useDocumintsMeta } from "./DocumintsMeta.provider.js";

/**
 * Rendered once per page (typically from the page's frontmatter) to set the
 * document title. Sets it directly during render for SSR string collection,
 * and via an effect for client-side navigations.
 */
export function DocumintsMetaComponent({ title }: { title?: string }) {
  const meta = useDocumintsMeta();
  meta.setTitle(title ?? "");

  useEffect(() => {
    if (typeof document !== "undefined" && title) {
      document.title = title;
    }
  }, [title]);

  return null;
}
