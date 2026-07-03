import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { makeSpace, makeColor, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type LayoutSidebarPropsNative = JSX.IntrinsicElements["aside"];
export type LayoutSidebarProps = LayoutSidebarPropsNative;

const styles = css`
  width: ${makeRem(220)};
  flex-shrink: 0;
  border-right: ${makeRem(1)} solid ${makeColor("neutral-dark", { opacity: 0.08 })};
  padding: ${makeSpace(8)} 0;
  overflow-x: hidden;
  overflow-y: auto;
  transition: width 0.2s ease-in-out;

  @media (max-width: 900px) {
    width: ${makeRem(56)};
  }
`;

export const LayoutSidebar = forwardRef<HTMLElement, LayoutSidebarProps>(function LayoutSidebar(
  { children, className, ...restProps },
  ref
) {
  return (
    <aside {...restProps} className={classes(styles, className)} ref={ref}>
      {children}
    </aside>
  );
});
