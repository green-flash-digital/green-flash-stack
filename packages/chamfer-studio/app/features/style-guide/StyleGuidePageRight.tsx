import type { ReactNode } from "react";

export function StyleGuidePageRight(props: { children: ReactNode }) {
  return <div className="right">{props.children}</div>;
}
