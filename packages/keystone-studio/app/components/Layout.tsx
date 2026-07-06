import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { makeFontFamily } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type LayoutPropsNative = JSX.IntrinsicElements["body"];
export type LayoutProps = LayoutPropsNative;

const bodyStyles = css`
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100dvh;
  overflow: hidden;

  :global() {
    html,
    body {
      margin: 0;
      padding: 0;
    }

    * {
      box-sizing: border-box;
      font-family: ${makeFontFamily("mulish")};

      &::after,
      &::before {
        box-sizing: border-box;
      }
    }
  }

  * {
    box-sizing: border-box;
    font-family: ${makeFontFamily("mulish")};
  }
`;

export const Layout = forwardRef<HTMLBodyElement, LayoutProps>(function Layout(
  { children, className, ...restProps },
  ref
) {
  return (
    <body {...restProps} className={classes(bodyStyles, className)} ref={ref}>
      {children}
    </body>
  );
});
