import type { ReactNode } from "react";

import { makeCustom, makeRem } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

const styles = css`
  padding: ${makeCustom("layout-gutters")};

  h4 {
    font-size: ${makeRem(14)};
    margin-top: 0;
  }
`;

export function LayoutPreviewSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className={styles}>
      <h4>{title}</h4>
      {children}
    </div>
  );
}
