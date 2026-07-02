import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "@green-flash/ts-utils/isomorphic";

import { css } from "@linaria/core";

export type LayoutMainPropsNative = JSX.IntrinsicElements["main"];
export type LayoutMainProps = LayoutMainPropsNative;

const styles = css`
  background: #fafafa;
`;

export const LayoutMain = forwardRef<HTMLElement, LayoutMainProps>(function LayoutMain(
  { children, className, ...restProps },
  ref
) {
  return (
    <main {...restProps} className={classes(styles, className)} ref={ref}>
      {children}
    </main>
  );
});
