import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

export type LayoutConfigSectionPreviewPropsNative = JSX.IntrinsicElements["div"];
export type LayoutConfigSectionPreviewProps = LayoutConfigSectionPreviewPropsNative;

const styles = css`
  background: inherit;
`;

export const LayoutConfigSectionPreview = forwardRef<
  HTMLDivElement,
  LayoutConfigSectionPreviewProps
>(function LayoutConfigSectionPreview({ children, className, ...restProps }, ref) {
  return (
    <div {...restProps} className={classes(styles, className)} ref={ref}>
      {children}
    </div>
  );
});
