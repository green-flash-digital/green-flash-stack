import type { JSX } from "react";
import { forwardRef } from "react";

import { makeSpace, makeReset, makeRem } from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
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
