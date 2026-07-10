import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { makeSpace, makeRem, makeReset } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

export type InputColorPropsNative = Omit<JSX.IntrinsicElements["input"], "type">;
export type InputColorPropsCustom = {
  dxSize: "dense" | "regular";
};
export type InputColorProps = InputColorPropsNative & InputColorPropsCustom;

const styles = css`
  ${makeReset("input")};

  /* Add custom styling for the color picker circle */
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  &::-webkit-color-swatch {
    border: none;
  }

  /* Adjustments for non-Webkit browsers */
  &::-moz-color-swatch {
    border: none;
  }

  &.s-dense {
    border-radius: ${makeRem(2)};
    height: ${makeSpace(24)};
    aspect-ratio: 1 / 1;
  }

  &.s-regular {
    border-radius: ${makeSpace(4)};
    height: ${makeSpace(32)};
    aspect-ratio: 1 / 1;
  }
`;

export const InputColor = forwardRef<HTMLInputElement, InputColorProps>(function InputColor(
  { className, dxSize, ...restProps },
  ref
) {
  return (
    <input
      {...restProps}
      type="color"
      className={classes(styles, className, {
        [`s-${dxSize}`]: dxSize
      })}
      ref={ref}
    />
  );
});
