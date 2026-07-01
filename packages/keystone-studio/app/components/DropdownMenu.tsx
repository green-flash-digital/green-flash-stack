import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { makeSpace, makeReset, makeRem } from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type DropdownMenuPropsNative = JSX.IntrinsicElements["ul"];
export type DropdownMenuProps = DropdownMenuPropsNative;

const styles = css`
  ${makeReset("ul")};
  min-width: ${makeRem(300)};
  padding: ${makeSpace(8)};
`;

export const DropdownMenu = forwardRef<HTMLUListElement, DropdownMenuProps>(function DropdownMenu(
  { children, className, ...restProps },
  ref
) {
  return (
    <ul {...restProps} className={classes(styles, className)} ref={ref}>
      {children}
    </ul>
  );
});
