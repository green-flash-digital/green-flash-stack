import type { JSX } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { makeColor, makeRem } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

export type LayoutNavProps = JSX.IntrinsicElements["aside"];

const styles = css`
  grid-area: nav;
  background: white;

  h4 {
    padding: ${makeRem(8)} ${makeRem(12)};
    font-size: ${makeRem(14)};
    color: ${makeColor("neutral-100")};
    margin: 0;
    border-bottom: 1px solid #ededed;
  }
  nav {
    padding: ${makeRem(16)};
  }
`;

export function LayoutNav({ children, className, ...restProps }: LayoutNavProps) {
  return (
    <aside {...restProps} className={classes(styles, className)}>
      <h4>Pages</h4>
      <nav>{children}</nav>
    </aside>
  );
}
