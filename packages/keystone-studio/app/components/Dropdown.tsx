import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { makeSpace, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type DropdownPropsNative = JSX.IntrinsicElements["div"];
export type DropdownProps = DropdownPropsNative;

const styles = css`
  @starting-style {
    display: none;
    position: absolute;
    pointer-events: none;
  }

  --arrow-color: white;

  border: none;
  transform: scale(0.9);
  filter: drop-shadow(3px 8px 28px rgba(130, 130, 130, 0.3));
  border-radius: ${makeSpace(4)};
  padding: ${makeSpace(8)} 0;

  /* Animation for appearing */
  @keyframes appear {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      z-index: -1;
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
      transform: scale(0.9);
    }
  }

  &.open {
    animation: appear 0.15s forwards;
  }

  &.close {
    animation: disappear 0.15s forwards;
    pointer-events: none;
    z-index: -1;
  }
`;

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(
  { children, className, ...restProps },
  ref
) {
  return (
    <div {...restProps} className={classes(styles, className)} ref={ref}>
      {children}
    </div>
  );
});
