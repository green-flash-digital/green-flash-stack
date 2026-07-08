import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import {
  makeSpace,
  makeColor,
  makeFontWeight,
  makeRem,
  makeReset
} from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

export type LayoutHeaderNavPropsNative = JSX.IntrinsicElements["nav"];
export type LayoutHeaderNavProps = LayoutHeaderNavPropsNative;

const styles = css`
  ul {
    ${makeReset("ul")};
    display: flex;
    justify-content: center;
    align-items: center;
    gap: ${makeSpace(16)};
  }

  a {
    ${makeReset("anchor")};
    font-size: ${makeSpace(16)};
    text-transform: uppercase;
    letter-spacing: -1px;
    font-weight: ${makeFontWeight("mulish-medium")};

    &.active {
      color: ${makeColor("secondary-600")};
    }
  }
`;

export const LayoutHeaderNav = forwardRef<HTMLElement, LayoutHeaderNavProps>(
  function LayoutHeaderNav({ children, className, ...restProps }, ref) {
    return (
      <nav {...restProps} className={classes(styles, className)} ref={ref}>
        {children}
      </nav>
    );
  }
);
