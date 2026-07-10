import { createContext, useContext, useRef, type ReactNode } from "react";

import { DocumintsMeta } from "./DocumintsMeta.js";

const DocumintsMetaContext = createContext<DocumintsMeta | null>(null);

export function DocumintsMetaProvider({
  documintsMeta,
  children,
}: {
  /** Server usage supplies a per-request instance; client usage creates its own. */
  documintsMeta?: DocumintsMeta;
  children: ReactNode;
}) {
  const metaRef = useRef(documintsMeta ?? new DocumintsMeta());

  return (
    <DocumintsMetaContext.Provider value={metaRef.current}>
      {children}
    </DocumintsMetaContext.Provider>
  );
}

export function useDocumintsMeta(): DocumintsMeta {
  const meta = useContext(DocumintsMetaContext);
  if (!meta) {
    throw new Error("useDocumintsMeta must be used within a DocumintsMetaProvider");
  }
  return meta;
}
