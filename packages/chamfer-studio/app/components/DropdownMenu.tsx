import type { JSX } from "react";
import { forwardRef } from "react";

import { makeSpace, makeReset, makeRem } from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

export type DropdownMenuPropsNative = JSX.IntrinsicElements["ul"];
export type DropdownMenuProps = DropdownMenuPropsNative;

const styles = css`
  ${makeReset("ul")};
  min-width: ${makeRem(200)};
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
