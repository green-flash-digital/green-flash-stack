import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { makeSpace, makeRem, makeColor, makeReset } from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { IconArrowDown } from "~/icons/IconArrowDown";

export type InputSelectPropsNative = JSX.IntrinsicElements["select"];
export type InputSelectPropsCustom = {
  dxSize: "dense";
};
export type InputSelectProps = InputSelectPropsNative & InputSelectPropsCustom;

const divStyles = css`
  position: relative;
  background: white;
  border: ${makeRem(1)} solid ${makeColor("neutral", { opacity: 0.1 })};
  border-radius: ${makeRem(2)};

  &:has(select:focus) {
    border-color: ${makeColor("primary-100")};
  }

  &:has(select:disabled) {
    background: ${makeColor("neutral-light", { opacity: 0.1 })};
  }

  .icon {
    position: absolute;
    right: 0;
    z-index: 10;
    top: 50%;
    pointer-events: none;
  }

  &:has(.s-dense) {
    .icon {
      margin-top: -${makeRem(6)};
      right: ${makeRem(6)};
    }
  }
`;

const styles = css`
  ${makeReset("input")};
  border: none;
  transition: all 0.1s ease-in-out;
  width: 100%;

  &.s-dense {
    height: ${makeSpace(28)};
    font-size: ${makeRem(14)};
    padding: 0 ${makeSpace(8)};
  }

  &:invalid {
    color: ${makeColor("neutral-light", { opacity: 0.3 })};
  }
`;

export const InputSelect = forwardRef<HTMLSelectElement, InputSelectProps>(function InputSelect(
  { children, className, dxSize, ...restProps },
  ref
) {
  return (
    <div className={classes(divStyles, "input-select")}>
      <select
        {...restProps}
        className={classes(styles, className, {
          [`s-${dxSize}`]: dxSize
        })}
        ref={ref}
      >
        {children}
      </select>
      <IconArrowDown dxSize={12} className="icon" />
    </div>
  );
});
