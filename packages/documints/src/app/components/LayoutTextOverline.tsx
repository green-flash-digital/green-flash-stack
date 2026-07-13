import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

import { makeColor, makeFontWeight, makeRem, makeReset } from "../../../.chamfer/index.js";

export type LayoutTextOverlinePropsNative = JSX.IntrinsicElements["div"];
export type LayoutTextOverlineProps = LayoutTextOverlinePropsNative;

export const layoutNavOverlineCSS = css`
  ${makeReset("anchor")};
  font-size: ${makeRem(12)};
  text-transform: uppercase;
  font-weight: ${makeFontWeight("source-sans-3-bold")};
  color: ${makeColor("neutral-900")};
`;

export const LayoutTextOverline = forwardRef<HTMLDivElement, LayoutTextOverlineProps>(
  function LayoutTextOverline({ children, className, ...restProps }, ref) {
    return (
      <div {...restProps} className={classes(layoutNavOverlineCSS, className)} ref={ref}>
        {children}
      </div>
    );
  }
);
