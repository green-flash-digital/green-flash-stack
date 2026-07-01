import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import {
  makeSpace,
  makeRem,
  makeCustom,
  makeReset,
  makeFontWeight
} from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { InformationCircleIcon } from "~/icons/IconInformationCircle";

export type LayoutConfigSectionControlsTitlePropsNative = JSX.IntrinsicElements["div"];
export type LayoutConfigSectionControlsTitlePropsCustom = {
  dxTitle: string;
};
export type LayoutConfigSectionControlsTitleProps = LayoutConfigSectionControlsTitlePropsNative &
  LayoutConfigSectionControlsTitlePropsCustom;

const styles = css`
  display: flex;
  align-items: center;
  top: ${makeRem(133)};
  position: sticky;
  background: inherit;
  height: ${makeCustom("layout-section-title-height")};
  z-index: 10;
  gap: ${makeSpace(8)};

  button {
    ${makeReset("button")};
    height: ${makeSpace(24)};
    aspect-ratio: 1 / 1;
    display: grid;
    place-content: center;
  }

  h3 {
    margin: 0;
    font-size: ${makeSpace(20)};
    font-weight: ${makeFontWeight("mulish-bold")};
  }
`;

export const LayoutConfigSectionControlsTitle = forwardRef<
  HTMLDivElement,
  LayoutConfigSectionControlsTitleProps
>(function LayoutConfigSectionControlsTitle({ children, className, dxTitle, ...restProps }, ref) {
  return (
    <div {...restProps} className={classes(styles, className, "title")} ref={ref}>
      <h3>{dxTitle}</h3>
      <button>
        <InformationCircleIcon dxSize={16} />
      </button>
      {children}
    </div>
  );
});
