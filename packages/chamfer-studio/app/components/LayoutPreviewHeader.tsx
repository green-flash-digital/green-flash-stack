import type { ReactNode } from "react";

import { makeCustom } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

const styles = css`
  grid-area: preview-header;
  display: flex;
  align-items: center;
  top: 0;
  position: sticky;
  background: inherit;
  height: ${makeCustom("layout-section-title-height")};
  z-index: 10;
  justify-content: flex-end;
  background: inherit;
  border-bottom: 1px solid #e8e8e8;
  padding: 0 ${makeCustom("layout-gutters")};
`;

export function LayoutPreviewHeader({ children }: { children: ReactNode }) {
  return <div className={styles}>{children}</div>;
}
