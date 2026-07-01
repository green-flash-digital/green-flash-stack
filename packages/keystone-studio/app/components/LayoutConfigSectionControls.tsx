import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { makeColor, makeCustom, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type LayoutConfigSectionControlsPropsNative = JSX.IntrinsicElements["article"];
export type LayoutConfigSectionControlsProps = LayoutConfigSectionControlsPropsNative;

const styles = css`
  padding: 0 ${makeCustom("layout-gutters")};
  padding-bottom: ${makeCustom("layout-gutters")};
  border-right: ${makeRem(1)} solid ${makeColor("neutral-light", { opacity: 0.2 })};
  background-color: #fafafa;
`;

export const LayoutConfigSectionControls = forwardRef<
  HTMLElement,
  LayoutConfigSectionControlsProps
>(function LayoutConfigSectionControls({ children, className, ...restProps }, ref) {
  return (
    <article {...restProps} className={classes(styles, className)} ref={ref}>
      {children}
    </article>
  );
});
