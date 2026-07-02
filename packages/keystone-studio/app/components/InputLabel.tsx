import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "@green-flash/ts-utils/isomorphic";

import {
  makeSpace,
  makeColor,
  makeFontFamily,
  makeFontWeight,
  makeRem
} from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type InputLabelPropsNative = JSX.IntrinsicElements["label"];
export type InputLabelPropsCustom = {
  /**
   * The string value that will be displayed as the label
   */
  dxLabel: string;
  /**
   * Optional string to better contextualize the input right below the input
   */
  dxHelp?: string;
  /**
   * An optional size for the label
   * @default "normal"
   */
  dxSize?: "dense" | "normal";
};
export type InputLabelProps = InputLabelPropsNative & InputLabelPropsCustom;

const styles = css`
  display: inline-block;
  vertical-align: top;

  .label {
    font-size: ${makeSpace(16)};
    font-family: ${makeFontFamily("mulish")};
    font-weight: ${makeFontWeight("mulish-semiBold")};
    color: ${makeColor("neutral-dark")};
    margin-bottom: ${makeSpace(8)};

    &.dense {
      font-size: ${makeRem(14)};
      margin-bottom: ${makeRem(6)};
    }
  }

  .help {
    margin-top: ${makeSpace(4)};
    font-size: ${makeRem(14)};
    color: ${makeColor("neutral-dark", { opacity: 0.8 })};
    font-weight: ${makeFontWeight("mulish-regular")};

    &.dense {
      font-size: ${makeSpace(12)};
      margin-top: ${makeRem(0)};
    }
  }
`;

export const InputLabel = forwardRef<HTMLLabelElement, InputLabelProps>(function InputLabel(
  { children, className, dxLabel, dxHelp, dxSize = "normal", ...restProps },
  ref
) {
  return (
    <label {...restProps} className={classes(styles, className)} ref={ref}>
      <div className={classes("label", dxSize)}>
        <div>{dxLabel}</div>
        {dxHelp && <div className={classes("help", dxSize)}>{dxHelp}</div>}
      </div>
      {children}
    </label>
  );
});
