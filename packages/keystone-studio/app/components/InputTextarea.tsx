import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { makeSpace, makeRem, makeColor, makeReset } from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type InputTextareaPropsNative = JSX.IntrinsicElements["textarea"];
export type InputTextareaPropsCustom = {
  dxSize: "dense";
};
export type InputTextareaProps = InputTextareaPropsNative & InputTextareaPropsCustom;

const styles = css`
  ${makeReset("input")};
  width: 100%;

  &.s-dense {
    font-size: ${makeRem(14)};
    min-height: ${makeRem(80)};

    border: ${makeRem(1)} solid ${makeColor("neutral", { opacity: 0.1 })};
    border-radius: ${makeRem(2)};
    padding: ${makeSpace(8)};
    transition: all 0.1s ease-in-out;
    background: ${makeColor("neutral-light", { opacity: 0.05 })};

    &:focus {
      border-color: ${makeColor("primary-100")};
    }

    &:disabled {
      background: ${makeColor("neutral-light", { opacity: 0.1 })};
    }
  }
`;

export function createInputTextareaClassName<T extends { dxSize: "dense" }>({ dxSize }: T) {
  return classes(styles, {
    [`s-${dxSize}`]: dxSize
  });
}

export const InputTextarea = forwardRef<HTMLTextAreaElement, InputTextareaProps>(
  function InputTextarea({ children, className, dxSize, ...restProps }, ref) {
    return (
      <textarea
        {...restProps}
        className={classes(createInputTextareaClassName({ dxSize }), className)}
        ref={ref}
      >
        {children}
      </textarea>
    );
  }
);
