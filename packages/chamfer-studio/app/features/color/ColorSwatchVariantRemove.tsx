import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { makeSpace, makeReset, makeRem } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { IconDelete } from "~/icons/IconDelete";

export type ColorSwatchVariantRemovePropsNative = JSX.IntrinsicElements["button"];
export type ColorSwatchVariantRemovePropsCustom = {
  dxIsVisible: boolean;
};
export type ColorSwatchVariantRemoveProps = ColorSwatchVariantRemovePropsNative &
  ColorSwatchVariantRemovePropsCustom;

const styles = css`
  ${makeReset("button")};
  width: ${makeSpace(24)};
  aspect-ratio: 1 / 1;
`;

export const ColorSwatchVariantRemove = forwardRef<
  HTMLButtonElement,
  ColorSwatchVariantRemoveProps
>(function ColorSwatchVariantRemove({ children, className, dxIsVisible, ...restProps }, ref) {
  if (!dxIsVisible) return <div />;
  return (
    <button {...restProps} type="button" className={classes(styles, className)} ref={ref}>
      <IconDelete dxSize={12} />
    </button>
  );
});
