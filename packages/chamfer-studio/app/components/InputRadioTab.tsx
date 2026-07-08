import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import {
  makeSpace,
  makeColor,
  makeFontFamily,
  makeFontWeight,
  makeRem,
  makeReset
} from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

export type InputRadioTabPropsNative = JSX.IntrinsicElements["input"];
export type InputRadioTabPropsCustom = {
  dxSize: "dense" | "normal" | "big";
  dxLabel: string;
  dxSubLabel?: string;
};
export type InputRadioTabProps = InputRadioTabPropsNative & InputRadioTabPropsCustom;

const styles = css`
  display: grid;
  place-content: center;
  width: 100%;
  font-family: ${makeFontFamily("mulish")};
  text-align: center;
  z-index: 2;

  &:has(input:checked) {
    .r-label {
      font-weight: ${makeFontWeight("mulish-bold")};
    }
  }

  &.s {
    &-dense {
      padding: ${makeSpace(8)} 0;
      min-height: ${makeSpace(32)};

      .r-label {
        font-size: ${makeSpace(12)};
      }

      .sub-label {
        font-size: ${makeRem(10)};
        color: ${makeColor("neutral-light", { opacity: 0.5 })};
      }
    }
    &-normal {
      font-size: ${makeSpace(16)};
    }
    &-big {
      font-size: ${makeSpace(20)};
    }
  }

  input {
    ${makeReset("input")};
  }
`;

export const InputRadioTab = forwardRef<HTMLInputElement, InputRadioTabProps>(
  function InputRadioTab({ children, className, dxSize, dxLabel, dxSubLabel, ...restProps }, ref) {
    return (
      <label
        className={classes(
          styles,
          {
            [`s-${dxSize}`]: dxSize
          },
          className
        )}
      >
        <input {...restProps} type="radio" ref={ref} />
        <div className="r-label">{dxLabel}</div>
        {dxSubLabel && <div className="sub-label">{dxSubLabel}</div>}
      </label>
    );
  }
);
