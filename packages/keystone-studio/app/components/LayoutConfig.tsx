import type { ReactNode } from "react";

import { css } from "@linaria/core";

const styles = css`
  grid-area: config;
`;

export function LayoutConfig({ children }: { children: ReactNode }) {
  return <div className={styles}>{children}</div>;
}
