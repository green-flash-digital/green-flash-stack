import type { JSX } from "react";
import { forwardRef } from "react";

import { makeSpace, makeRem, makeColor, makeReset } from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

export type InputTextPropsNative = Omit<JSX.IntrinsicElements["input"], "type">;
export type InputTextPropsCustom = {
  /**
   * A customized type that tells the input what type it should be
   */
  dxType?: "text" | "number" | "password";
  dxSize: "dense" | "normal";
};
export type InputTextProps = InputTextPropsNative & InputTextPropsCustom;

const styles = css`
  ${makeReset("input")};
  border: ${makeRem(1)} solid ${makeColor("neutral", { opacity: 0.1 })};
  transition: all 0.1s ease-in-out;
  background: white;

  &:focus {
    border-color: ${makeColor("primary-100")};
  }

  &:disabled {
    background: ${makeColor("neutral-light", { opacity: 0.1 })};
  }

  &.s-dense {
    height: ${makeSpace(28)};
    font-size: ${makeRem(14)};
    border-radius: ${makeRem(2)};
    padding: 0 ${makeSpace(8)};
  }

  &.s-normal {
    height: ${makeSpace(32)};
    font-size: ${makeSpace(16)};
    border-radius: ${makeSpace(4)};
    padding: 0 ${makeSpace(12)};
  }
`;

export function createInputTextClassName<T extends { dxSize: "dense" | "normal" }>({ dxSize }: T) {
  return classes(styles, {
    [`s-${dxSize}`]: dxSize
  });
}

export const InputText = forwardRef<HTMLInputElement, InputTextProps>(function InputText(
  { children, className, dxType = "text", dxSize, ...restProps },
  ref
) {
  return (
    <input
      {...restProps}
      className={classes(createInputTextClassName({ dxSize }), className)}
      type={dxType}
      ref={ref}
    >
      {children}
    </input>
  );
});
