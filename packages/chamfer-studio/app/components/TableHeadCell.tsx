import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { makeSpace, makeColor, makeFontWeight, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type TableHeadCellPropsNative = JSX.IntrinsicElements["th"];
export type TableHeadCellPropsCustom = {
  dxTest?: string;
};
export type TableHeadCellProps = TableHeadCellPropsNative & TableHeadCellPropsCustom;

const styles = css`
  font-size: ${makeRem(14)};
  font-weight: ${makeFontWeight("mulish-bold")};
  text-align: left;
  padding: 0 ${makeSpace(16)};
  height: ${makeSpace(40)};
  white-space: nowrap;
  border-bottom: 1px solid ${makeColor("neutral-light", { opacity: 0.1 })};

  & + & {
    border-left: 1px solid ${makeColor("neutral-light", { opacity: 0.1 })};
  }
`;

export const TableHeadCell = forwardRef<HTMLTableCellElement, TableHeadCellProps>(
  function TableHeadCell({ children, className, ...restProps }, ref) {
    return (
      <th {...restProps} className={classes(styles, className)} ref={ref}>
        {children}
      </th>
    );
  }
);
