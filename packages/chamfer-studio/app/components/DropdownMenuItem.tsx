import type { JSX } from "react";
import { forwardRef } from "react";

import { makeSpace, makeReset, makeRem, makeColor } from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

import type { IconInspectCode } from "~/icons/IconInspectCode";

export type DropdownMenuItemPropsNative = JSX.IntrinsicElements["button"];
export type DropdownMenuItemPropsCustom = {
  dxTitle: string;
  DXIcon: typeof IconInspectCode;
};
export type DropdownMenuItemProps = DropdownMenuItemPropsNative & DropdownMenuItemPropsCustom;

const styles = css`
  ${makeReset("button")};
  display: flex;
  align-items: center;
  gap: ${makeSpace(12)};
  width: 100%;
  text-align: left;
  padding: ${makeRem(10)} ${makeRem(12)} !important;
  border-radius: ${makeSpace(6)};
  cursor: pointer;
  transition: background 0.1s ease-in-out;

  &:hover,
  &:focus {
    background: ${makeColor("neutral", { opacity: 0.06 })};
  }

  .icon {
    display: grid;
    place-content: center;
    color: ${makeColor("neutral", { opacity: 0.7 })};
  }

  .title {
    font-size: ${makeRem(14)};
    color: ${makeColor("neutral-dark")};
  }
`;

export const DropdownMenuItem = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  function DropdownMenuItem({ children, className, dxTitle, DXIcon, ...restProps }, ref) {
    return (
      <button {...restProps} className={classes(styles, className)} ref={ref}>
        <div className="icon">
          <DXIcon dxSize={18} />
        </div>
        <div className="title">{dxTitle}</div>
      </button>
    );
  }
);
