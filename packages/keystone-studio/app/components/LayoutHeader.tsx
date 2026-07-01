import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { makeSpace, makeColor, makeCustom, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type LayoutHeaderPropsNative = JSX.IntrinsicElements["header"];
export type LayoutHeaderProps = LayoutHeaderPropsNative;

const styles = css`
  height: ${makeCustom("layout-header-height")};
  border-bottom: ${makeRem(1)} solid ${makeColor("neutral-dark", { opacity: 0.1 })};

  & > div {
    margin: 0 auto;
    max-width: ${makeCustom("layout-max-width")};
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    gap: ${makeSpace(16)};
    align-items: center;
    margin: 0 auto;
    padding: 0 ${makeCustom("layout-gutters")};
  }
`;

export const LayoutHeader = forwardRef<HTMLElement, LayoutHeaderProps>(function LayoutHeader(
  { children, className, ...restProps },
  ref
) {
  return (
    <header {...restProps} className={classes(styles, className)} ref={ref}>
      <div>{children}</div>
    </header>
  );
});
