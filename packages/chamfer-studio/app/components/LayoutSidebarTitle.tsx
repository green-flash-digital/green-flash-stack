import type { ReactNode } from "react";

import { makeColor, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

const styles = css`
  padding: ${makeRem(8)} ${makeRem(12)};
  font-size: ${makeRem(14)};
  color: ${makeColor("neutral-100")};
  margin: 0;
  margin-bottom: ${makeRem(4)};
`;

export function LayoutSidebarTitle({ children }: { children: ReactNode }) {
  return <h2 className={styles}>{children}</h2>;
}
