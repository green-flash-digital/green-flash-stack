import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { makeRem, makeCustom } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type LayoutConfigSectionPreviewTitlePropsNative = JSX.IntrinsicElements["div"];
export type LayoutConfigSectionPreviewTitleProps = LayoutConfigSectionPreviewTitlePropsNative;

const styles = css`
  display: flex;
  align-items: center;
  top: ${makeRem(133)};
  position: sticky;
  background: inherit;
  height: ${makeCustom("layout-section-title-height")};
  z-index: 10;
`;

export const LayoutConfigSectionPreviewTitle = forwardRef<
  HTMLDivElement,
  LayoutConfigSectionPreviewTitleProps
>(function LayoutConfigSectionPreviewTitle({ children, className, ...restProps }, ref) {
  return (
    <div {...restProps} className={classes(styles, className, "title")} ref={ref}>
      {children}
    </div>
  );
});
