import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { makeSpace, makeColor, makeFontWeight, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type TableBodyCellPropsNative = JSX.IntrinsicElements["th"];
export type TableBodyCellPropsCustom = {
  dxTest?: string;
};
export type TableBodyCellProps = TableBodyCellPropsNative & TableBodyCellPropsCustom;

const styles = css`
  font-size: ${makeSpace(16)};
  font-weight: ${makeFontWeight("mulish-regular")};
  text-align: left;

  padding: ${makeSpace(16)};
  height: ${makeSpace(40)};
  vertical-align: text-top;
  border-bottom: 1px solid ${makeColor("neutral-light", { opacity: 0.1 })};

  & + & {
    border-left: 1px solid ${makeColor("neutral-light", { opacity: 0.1 })};
  }
`;

export const TableBodyCell = forwardRef<HTMLTableCellElement, TableBodyCellProps>(
  function TableBodyCell({ children, className, ...restProps }, ref) {
    return (
      <th {...restProps} className={classes(styles, className)} ref={ref}>
        {children}
      </th>
    );
  }
);
