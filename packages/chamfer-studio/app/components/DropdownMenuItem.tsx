import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import {
  makeSpace,
  makeReset,
  makeRem,
  makeColor,
  makeFontWeight
} from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import type { IconInspectCode } from "~/icons/IconInspectCode";

export type DropdownMenuItemPropsNative = JSX.IntrinsicElements["button"];
export type DropdownMenuItemPropsCustom = {
  dxTitle: string;
  dxSubtitle: string;
  /**
   * The color or theme of the icon in the menu item
   * @default primary
   */
  dxTheme?: "primary" | "secondary";
  DXIcon: typeof IconInspectCode;
};
export type DropdownMenuItemProps = DropdownMenuItemPropsNative & DropdownMenuItemPropsCustom;

const styles = css`
  ${makeReset("button")};
  text-align: left;
  padding: ${makeSpace(12)} !important;
  cursor: pointer;

  display: grid;
  grid-template-columns: ${makeRem(38)} auto;
  grid-template-rows: auto auto;
  grid-template-areas:
    "icon title"
    "icon subtitle";
  column-gap: ${makeSpace(12)};
  row-gap: ${makeSpace(4)};
  border-radius: ${makeSpace(4)};
  transition: all 0.15s ease-in-out;

  &:hover {
    background: ${makeColor("primary-300", { opacity: 0.2 })};
  }
  &:focus {
    background: ${makeColor("primary-200", { opacity: 0.3 })};
  }

  .icon {
    grid-area: icon;
    display: grid;
    place-content: center;
    height: 100%;
    border-radius: ${makeSpace(4)};

    &.primary {
      background: ${makeColor("primary-500", { opacity: 0.2 })};
    }
    &.secondary {
      background: ${makeColor("secondary-500", { opacity: 0.2 })};
    }
  }
  .title {
    grid-area: title;
    font-weight: ${makeFontWeight("mulish-medium")};
    color: ${makeColor("neutral")};
    font-size: ${makeSpace(16)};
  }
  .subtitle {
    grid-area: subtitle;
    white-space: nowrap;
    font-size: ${makeSpace(12)};
    color: ${makeColor("neutral", { opacity: 0.6 })};
  }
`;

export const DropdownMenuItem = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  function DropdownMenuItem(
    { children, className, dxTitle, dxSubtitle, DXIcon, dxTheme, ...restProps },
    ref
  ) {
    return (
      <button {...restProps} className={classes(styles, className)} ref={ref}>
        <div className={classes("icon", dxTheme)}>
          <DXIcon dxSize={16} />
        </div>
        <div className="title">{dxTitle}</div>
        <div className="subtitle">{dxSubtitle}</div>
      </button>
    );
  }
);
