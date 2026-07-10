import type { JSX } from "react";
import { forwardRef } from "react";

import { makeSpace, makeColor, makeRem } from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

export type VariantContainerContentPropsNative = JSX.IntrinsicElements["div"];
export type VariantContainerContentProps = VariantContainerContentPropsNative;

const styles = css`
  margin-top: ${makeSpace(16)};
  padding-top: ${makeSpace(16)};
  border-top: ${makeRem(1)} solid ${makeColor("neutral-light", { opacity: 0.2 })};
`;

export const VariantContainerContent = forwardRef<HTMLDivElement, VariantContainerContentProps>(
  function VariantContainerContent({ children, className, ...restProps }, ref) {
    return (
      <div {...restProps} className={classes(styles, className)} ref={ref}>
        {children}
      </div>
    );
  }
);
