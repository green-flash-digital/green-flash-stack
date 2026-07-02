import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { useDropdownTooltip } from "react-hook-primitives";

import { makeSpace, makeColor, makeFontFamily, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import "react-hook-primitives/styles";

export type TooltipVariant = "light" | "dark";
export type TooltipPropsNative = JSX.IntrinsicElements["div"];
export type TooltipPropsCustom = {
  dxVariant?: TooltipVariant;
};
export type TooltipProps = TooltipPropsNative & TooltipPropsCustom;

const styles = css`
  @starting-style {
    display: none;
  }
  --arrow-color: var(--tooltip-bg-color) !important;

  border-radius: ${makeSpace(4)};
  padding: ${makeSpace(16)};
  font-size: ${makeSpace(12)};
  font-family: ${makeFontFamily("mulish")};
  max-width: ${makeRem(300)};
  border: 0;
  filter: drop-shadow(1px 2px 3px var(--tooltip-bg-filter-color))
    drop-shadow(2px 4px 6px var(--tooltip-bg-filter-color))
    drop-shadow(4px 8px 12px var(--tooltip-bg-filter-color));
  background: var(--tooltip-bg-color);
  color: var(--tooltip-color);

  &.v-dark {
    --tooltip-bg-filter-color: ${makeColor("neutral", { opacity: 0.3 })};
    --tooltip-bg-color: ${makeColor("neutral-dark")};
    --tooltip-color: white;
  }

  &.v-light {
    --tooltip-bg-filter-color: ${makeColor("neutral", { opacity: 0.1 })};
    --tooltip-bg-color: white;
    --tooltip-color: ${makeColor("neutral")};
  }

  /* Animation for appearing */
  @keyframes appear {
    from {
      opacity: 0;
      transform: scale(0.94);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Animation for disappearing */
  @keyframes disappear {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.94);
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    &.open {
      animation: appear 0.1s ease-in-out forwards;
    }
    &.close {
      animation: disappear 0.1s ease-in-out forwards;
    }
  }
`;

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { children, className, dxVariant = "dark", ...restProps },
  ref
) {
  return (
    <div
      {...restProps}
      className={classes(styles, className, "tooltip", {
        [`v-${dxVariant}`]: dxVariant
      })}
      ref={ref}
    >
      <div>{children}</div>
    </div>
  );
});

export const useTooltip = useDropdownTooltip;
