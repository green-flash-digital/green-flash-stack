import type { ReactNode } from "react";

import { css } from "@linaria/core";

const styles = css`
  grid-area: preview;
  overflow-y: auto;
  height: 100%;
`;

export function LayoutPreview({ children }: { children: ReactNode }) {
  return <div className={styles}>{children}</div>;
}
