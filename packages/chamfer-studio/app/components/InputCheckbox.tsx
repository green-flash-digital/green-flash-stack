import type { JSX } from "react";
import { forwardRef } from "react";

import { makeSpace, makeColor, makeRem } from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

import { IconTick04Solid } from "~/icons/IconTick04Solid";

export type InputCheckboxPropsNative = Omit<JSX.IntrinsicElements["input"], "type">;
export type InputCheckboxPropsCustom = {
  dxSize?: "normal" | "big";
};
export type InputCheckboxProps = InputCheckboxPropsNative & InputCheckboxPropsCustom;

const styles = css`
  position: relative;
  height: ${makeSpace(24)};
  aspect-ratio: 1 / 1;
  display: grid;
  place-content: center;
  border-radius: ${makeSpace(4)};
  transition: all 0.1s ease-in-out;
  border: 1px solid transparent;

  &.s {
    &-normal {
      height: ${makeSpace(24)};

      span {
        height: ${makeSpace(16)};
        width: ${makeSpace(16)};
      }
    }
    &-big {
      height: ${makeSpace(32)};
      span {
        height: ${makeSpace(24)};
        width: ${makeSpace(24)};
      }
    }
  }

  input {
    position: absolute;
    margin: 0;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    border: 1px solid transparent;
    opacity: 0;
    border-radius: ${makeSpace(4)};
  }

  span {
    height: ${makeSpace(16)};
    width: ${makeSpace(16)};
    border-radius: ${makeSpace(4)};
    display: block;
    border: 1px solid ${makeColor("neutral-light", { opacity: 0.8 })};
    pointer-events: none;
    transition: all 0.1s ease-in-out;
    display: grid;
    place-content: center;
    & > * {
      opacity: 0;
      transition: inherit;
      color: white;
    }
  }
  &:has(input:checked) {
    span {
      border-color: ${makeColor("secondary-600")};
      background-color: ${makeColor("secondary-600")};

      & > * {
        opacity: 1;
      }
    }
  }
  &:has(input:focus) {
    border-color: ${makeColor("secondary")};
  }
`;

export const InputCheckbox = forwardRef<HTMLInputElement, InputCheckboxProps>(
  function InputCheckbox({ children, className, dxSize = "normal", ...restProps }, ref) {
    return (
      <div
        className={classes(styles, {
          [`s-${dxSize}`]: dxSize
        })}
      >
        <input type="checkbox" {...restProps} className={classes(className)} ref={ref} />
        <span>
          <IconTick04Solid dxSize={dxSize === "normal" ? 12 : 16} />
        </span>
      </div>
    );
  }
);
