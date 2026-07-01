import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { makeSpace, makeReset, makeRem } from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type VariantListPropsNative = JSX.IntrinsicElements["ul"];
export type VariantListProps = VariantListPropsNative;

const styles = css`
  ${makeReset("ul")};
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(8)};
`;

export const VariantList = forwardRef<HTMLUListElement, VariantListProps>(function VariantList(
  { children, className, ...restProps },
  ref
) {
  return (
    <ul {...restProps} className={classes(styles, className)} ref={ref}>
      {children}
    </ul>
  );
});
