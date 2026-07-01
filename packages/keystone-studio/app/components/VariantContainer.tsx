import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { makeSpace, makeColor, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type VariantContainerPropsNative = JSX.IntrinsicElements["div"];
export type VariantContainerPropsCustom = {
  dxStyle?: "normal" | "alt";
};
export type VariantContainerProps = VariantContainerPropsNative & VariantContainerPropsCustom;

const styles = css`
  width: 100%;
  border: 1px solid ${makeColor("neutral-light", { opacity: 0.2 })};
  border-radius: ${makeSpace(4)};

  &.normal {
    padding: ${makeSpace(16)};
    background: white;
  }

  &.alt {
    padding: ${makeSpace(8)};
    background: ${makeColor("neutral-light", { opacity: 0.1 })};
  }
`;

export const VariantContainer = forwardRef<HTMLDivElement, VariantContainerProps>(
  function VariantContainer({ children, className, dxStyle = "normal", ...restProps }, ref) {
    return (
      <div {...restProps} className={classes(styles, dxStyle, className)} ref={ref}>
        {children}
      </div>
    );
  }
);
