import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "@green-flash/ts-utils/isomorphic";

import { css } from "@linaria/core";

export type TablePropsNative = JSX.IntrinsicElements["table"];
export type TablePropsCustom = {
  dxTest?: string;
};
export type TableProps = TablePropsNative & TablePropsCustom;

const styles = css`
  width: 100%;
  position: relative;
  border: 0;
  padding: 0;
  border-spacing: 0;
  width: 100%;
  isolation: isolate;
`;

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { children, className, ...restProps },
  ref
) {
  return (
    <table {...restProps} className={classes(styles, className)} ref={ref}>
      {children}
    </table>
  );
});
