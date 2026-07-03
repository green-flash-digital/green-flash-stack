import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

export type StyleGuidePageBreakPropsNative = JSX.IntrinsicElements["div"];
export type StyleGuidePageBreakProps = StyleGuidePageBreakPropsNative;

const styles = css`
  display: block;
  break-after: page;
  page-break-after: always;
`;

export const StyleGuidePageBreak = forwardRef<HTMLDivElement, StyleGuidePageBreakProps>(
  function StyleGuidePageBreak({ children, className, ...restProps }, ref) {
    return (
      <div {...restProps} className={classes(styles, "page-break", className)} ref={ref}>
        {children}
      </div>
    );
  }
);
