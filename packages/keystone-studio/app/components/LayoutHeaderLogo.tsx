import type { JSX, ReactNode } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import {
  makeSpace,
  makeCustom,
  makeFontFamily,
  makeFontWeight,
  makeRem
} from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type LayoutHeaderLogoPropsNative = JSX.IntrinsicElements["div"];
export type LayoutHeaderLogoPropsCustom = {
  dxSrc: string;
  dxAlt: string;
  dxLabel?: ReactNode;
};
export type LayoutHeaderLogoProps = LayoutHeaderLogoPropsNative & LayoutHeaderLogoPropsCustom;

const styles = css`
  height: ${makeCustom("layout-header-height")};
  display: flex;
  align-items: center;
  gap: ${makeSpace(16)};

  img {
    height: 50%;
    width: auto;
    object-fit: contain;
  }

  .wordmark {
    span {
      font-size: ${makeSpace(24)};
      text-transform: uppercase;
      letter-spacing: -${makeRem(2)};
      font-family: ${makeFontFamily("poppins")};
      &:first-child {
        font-weight: ${makeFontWeight("poppins-medium")};
      }

      &:last-child {
        font-weight: ${makeFontWeight("poppins-bold")};
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-size: cover;
        background-image: linear-gradient(
          115deg,
          hsl(48deg 100% 48%) 0%,
          hsl(47deg 91% 50%) 15%,
          hsl(46deg 88% 52%) 22%,
          hsl(45deg 85% 53%) 28%,
          hsl(44deg 82% 55%) 33%,
          hsl(43deg 79% 56%) 37%,
          hsl(44deg 80% 57%) 42%,
          hsl(48deg 83% 58%) 46%,
          hsl(51deg 87% 59%) 50%,
          hsl(54deg 90% 59%) 54%,
          hsl(58deg 94% 60%) 58%,
          hsl(58deg 93% 59%) 63%,
          hsl(54deg 86% 55%) 67%,
          hsl(49deg 80% 51%) 72%,
          hsl(44deg 83% 47%) 78%,
          hsl(39deg 90% 44%) 85%,
          hsl(34deg 98% 40%) 100%
        );
      }
    }
  }
`;

export const LayoutHeaderLogo = forwardRef<HTMLDivElement, LayoutHeaderLogoProps>(
  function LayoutHeaderLogo({ children, className, dxAlt, dxSrc, dxLabel, ...restProps }, ref) {
    return (
      <div {...restProps} className={classes(styles, className)} ref={ref}>
        <img src={dxSrc} alt={dxAlt} />
        <div className="wordmark">
          <span>keystone</span>
          <span>tokens</span>
        </div>
        <div>{dxLabel}</div>
      </div>
    );
  }
);
