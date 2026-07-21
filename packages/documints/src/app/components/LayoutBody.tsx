import type { JSX } from "react";
import { forwardRef } from "react";

import { makeRem } from "@documints/tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

export type LayoutBodyPropsNative = JSX.IntrinsicElements["main"];
export type LayoutBodyProps = LayoutBodyPropsNative;

const layoutBodyStyles = css`
  display: grid;
  grid-area: layout-body;
  grid-template-columns: ${makeRem(300)} 1fr ${makeRem(300)};
  grid-template-rows: auto 1fr;
  // No min-height here - this grid item already stretches to fill its 1fr
  // row in the outer Layout grid (see Layout.tsx) by default. Forcing an
  // extra calc(100vh - header) min-height on top of that fought the outer
  // grid's own sizing and pushed the footer a full viewport below short
  // content instead of letting it sit right after it.
  grid-template-areas:
    "layout-sidebar layout-breadcrumb layout-toc"
    "layout-sidebar layout-main layout-toc";
  margin: 0 auto;
  width: 100%;
`;

export const LayoutBody = forwardRef<HTMLElement, LayoutBodyProps>(function LayoutBody(
  { children, className, ...restProps },
  ref
) {
  return (
    <main {...restProps} className={classes(layoutBodyStyles, className)} ref={ref}>
      {children}
    </main>
  );
});
