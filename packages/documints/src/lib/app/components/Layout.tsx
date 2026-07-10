import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

import { makeColor, makeCustom, makeFontFamily, makeRem } from "../../../../.chamfer/index.js";

export const bodyStyles = css`
  font-family: ${makeFontFamily("source-sans-3")};
  margin: 0;

  display: grid;
  min-height: 100vh;
  margin: 0 auto;
  // desktop
  grid-template-rows: ${makeCustom("layout-header-height")} auto;
  grid-template-columns: 1fr;
  grid-template-areas:
    "layout-header"
    "layout-body";

  pre {
    padding: ${makeRem(20)};
    overflow-x: auto;
    border-radius: ${makeRem(8)};
    font-size: ${makeRem(12)};

    .line {
      line-height: 1.5;
    }
  }
  background: ${makeColor("neutral-50", { opacity: 0.12 })};
`;

export type LayoutPropsNative = JSX.IntrinsicElements["div"];
export type LayoutProps = LayoutPropsNative;

export const Layout = forwardRef<HTMLDivElement, LayoutProps>(function Layout(
  { children, className, ...restProps },
  ref
) {
  return (
    <div {...restProps} className={classes(bodyStyles, className)} ref={ref}>
      {children}
    </div>
  );
});
