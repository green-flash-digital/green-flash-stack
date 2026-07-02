import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "@green-flash/ts-utils/isomorphic";

import { makeSpace, makeReset, makeRem, makeColor } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type ColorSwatchVariantAddPropsNative = JSX.IntrinsicElements["button"];
export type ColorSwatchVariantAddProps = ColorSwatchVariantAddPropsNative;

const styles = css`
  ${makeReset("button")};
  font-size: ${makeSpace(12)};
  color: ${makeColor("secondary-700")};
  text-align: left;
`;

export const ColorSwatchVariantAdd = forwardRef<HTMLButtonElement, ColorSwatchVariantAddProps>(
  function ColorSwatchVariantAdd({ children, className, ...restProps }, ref) {
    return (
      <button {...restProps} type="button" className={classes(styles, className)} ref={ref}>
        Add variant
      </button>
    );
  }
);
