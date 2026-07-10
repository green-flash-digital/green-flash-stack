import { classes } from "@buttery/components";
import {
  makeColor,
  makeFontWeight,
  makeRem,
  makeReset,
} from "@buttery/tokens/docs";
import { css } from "@linaria/core";
import type { JSX } from "react";
import { forwardRef } from "react";

export type LayoutTextOverlinePropsNative = JSX.IntrinsicElements["div"];
export type LayoutTextOverlineProps = LayoutTextOverlinePropsNative;

export const layoutNavOverlineCSS = css`
  ${makeReset("anchor")};
  font-size: ${makeRem(12)};
  text-transform: uppercase;
  font-weight: ${makeFontWeight("Source Sans 3-bold")};
  color: ${makeColor("neutral-900")};
`;

export const LayoutTextOverline = forwardRef<
  HTMLDivElement,
  LayoutTextOverlineProps
>(function LayoutTextOverline({ children, className, ...restProps }, ref) {
  return (
    <div
      {...restProps}
      className={classes(layoutNavOverlineCSS, className)}
      ref={ref}
    >
      {children}
    </div>
  );
});
