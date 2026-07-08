import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { exhaustiveMatchGuard } from "@green-flash/ts-utils/isomorphic";
import {
  makeSpace,
  makeColor,
  makeFontWeight,
  makeRem,
  makeReset
} from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import type { IconCopy } from "~/icons/IconCopy";

export type InputRadioPropsNative = Omit<
  JSX.IntrinsicElements["input"],
  "type" | "children" | "ref"
>;
export type InputRadioPropsCustom =
  | {
      dxVariant: "block";
      dxTextPrimary: string;
      dxTextSecondary: string;
      DXIcon: typeof IconCopy;
    }
  | {
      dxVariant: "normal";
      dxLabel: string;
    };
export type InputRadioProps = InputRadioPropsNative & InputRadioPropsCustom;

const styles = css`
  ${makeReset("input")};
  position: relative;

  input {
    position: absolute;
    left: -1000px;
  }

  &.v-block {
    display: grid;
    grid-template-columns: ${makeSpace(24)} 1fr;
    grid-template-rows: auto auto;
    grid-template-areas:
      "radio-icon radio-text-title"
      "radio-icon radio-text-description";
    column-gap: ${makeSpace(8)};
    border: ${makeRem(1)} solid ${makeColor("neutral", { opacity: 0.2 })};
    font-size: ${makeSpace(12)};
    transition: all 0.1s ease-in-out;
    min-height: ${makeRem(52)};
    align-content: center;
    border-radius: ${makeSpace(4)};
    padding: ${makeSpace(12)} ${makeSpace(16)};

    .icon {
      grid-area: radio-icon;
      display: grid;
      height: 100%;
      width: 100%;
      place-content: center;
    }
    .title {
      grid-area: radio-text-title;
      margin-bottom: ${makeSpace(4)};
      font-weight: ${makeFontWeight("mulish-semiBold")};
    }

    .description {
      grid-area: radio-text-description;
      color: ${makeColor("neutral-light", { opacity: 0.7 })};
      font-size: ${makeRem(11)};
    }

    &:has(input:checked) {
      border-color: ${makeColor("primary")};
      background: ${makeColor("primary", { opacity: 0.2 })};
    }

    &:has(input:focus) {
      border-color: ${makeColor("primary-200")};
    }

    &:has(input:active) {
      scale: 0.94;
    }

    &:has(input:hover:not(:checked)) {
      border-color: ${makeColor("primary-200")};
    }
  }
`;

export const InputRadio = forwardRef<HTMLInputElement, InputRadioProps>(
  function InputRadio(props, ref) {
    switch (props.dxVariant) {
      case "block": {
        const {
          className,
          dxTextPrimary,
          dxTextSecondary,
          DXIcon,
          dxVariant: _,
          ...restProps
        } = props;
        return (
          <label className={classes(styles, "v-block", className)}>
            <input {...restProps} ref={ref} type="radio" />
            <div className="icon">
              <DXIcon dxSize={16} />
            </div>
            <div className="title">{dxTextPrimary}</div>
            <div className="description">{dxTextSecondary}</div>
          </label>
        );
      }

      case "normal": {
        const { className, dxLabel, dxVariant: _, ...restProps } = props;
        return (
          <label className={classes(styles, "v-normal", className)}>
            <input {...restProps} ref={ref} />
            <span>{dxLabel}</span>
          </label>
        );
      }

      default:
        return exhaustiveMatchGuard(props);
    }
  }
);
