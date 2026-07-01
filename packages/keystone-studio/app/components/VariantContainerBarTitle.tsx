import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { css } from "@linaria/core";

export type VariantContainerBarTitlePropsNative = JSX.IntrinsicElements["h5"];
export type VariantContainerBarTitleProps = VariantContainerBarTitlePropsNative;

const styles = css`
  margin: 0;
`;

export const VariantContainerBarTitle = forwardRef<
  HTMLHeadingElement,
  VariantContainerBarTitleProps
>(function VariantContainerBarTitle({ children, className, ...restProps }, ref) {
  return (
    <h5 {...restProps} className={classes(styles, className)} ref={ref}>
      {children}
    </h5>
  );
});
