import type { JSX } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

const bodyStyles = css`
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  display: grid;
  grid-template-columns: auto 1fr;
  height: 100dvh;
  overflow: hidden;
`;

export function Layout({ children, className, ref, ...restProps }: JSX.IntrinsicElements["div"]) {
  return (
    <div {...restProps} className={classes(bodyStyles, className)} ref={ref}>
      {children}
    </div>
  );
}
