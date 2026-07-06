import type { ReactNode } from "react";

import { css } from "@linaria/core";

const styles = css``;

export function LayoutPreviewSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className={styles}>
      <div>{title}</div>
      {children}
    </div>
  );
}
