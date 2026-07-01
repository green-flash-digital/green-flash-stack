import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { makeColor, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type VariantContainerBarTextPropsNative = JSX.IntrinsicElements["div"];
export type VariantContainerBarTextProps = VariantContainerBarTextPropsNative;

const styles = css`
  margin: 0;
  font-size: ${makeRem(14)};
  color: ${makeColor("neutral-light", { opacity: 0.8 })};
`;

export const VariantContainerBarText = forwardRef<HTMLDivElement, VariantContainerBarTextProps>(
  function VariantContainerBarText({ children, className, ...restProps }, ref) {
    return (
      <div {...restProps} className={classes(styles, className)} ref={ref}>
        {children}
      </div>
    );
  }
);
