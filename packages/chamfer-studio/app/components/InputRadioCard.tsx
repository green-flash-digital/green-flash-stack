import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { makeSpace, makeColor, makeFontWeight, makeRem } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import type { IconCode } from "~/icons/IconCode";

export type InputRadioCardPropsNative = JSX.IntrinsicElements["input"];
export type InputRadioCardPropsCustom = {
  DXIcon: typeof IconCode;
  dxTitle: string;
  dxDescription: string;
  dxHelp?: string;
};
export type InputRadioCardProps = InputRadioCardPropsNative & InputRadioCardPropsCustom;

const styles = css`
  padding: ${makeSpace(16)};
  border-radius: ${makeSpace(4)};
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: ${makeRem(6)};
  border: ${makeRem(1)} solid ${makeColor("neutral", { opacity: 0.2 })};
  font-size: ${makeSpace(12)};
  transition: all 0.1s ease-in-out;
  background: white;

  &:has(input:checked) {
    border-color: ${makeColor("primary")};
    background: ${makeColor("primary", { opacity: 0.2 })};
    scale: 1;
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

  .title {
    font-weight: ${makeFontWeight("mulish-bold")};
  }

  .help {
    font-size: ${makeRem(10)};
    margin-top: ${makeSpace(8)};
    color: ${makeColor("neutral", { opacity: 0.5 })};
  }

  input {
    position: absolute;
    left: -1000px;
    visibility: hidden;
  }
`;

export const InputRadioCard = forwardRef<HTMLInputElement, InputRadioCardProps>(
  function InputRadioCard(
    { children, className, DXIcon, dxTitle, dxDescription, dxHelp, ...restProps },
    ref
  ) {
    return (
      <label className={styles}>
        <div>
          <DXIcon dxSize={20} />
        </div>
        <div className="title">{dxTitle}</div>
        <div className="description">{dxDescription}</div>
        {dxHelp && <div className="help">{dxHelp}</div>}
        <input {...restProps} className={classes(className)} ref={ref} type="radio">
          {children}
        </input>
      </label>
    );
  }
);
