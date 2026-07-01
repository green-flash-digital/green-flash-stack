import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { makeSpace, makeRem } from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type InputGroupPropsNative = JSX.IntrinsicElements["div"];
// export type InputGroupPropsCustom = {};
export type InputGroupProps = InputGroupPropsNative;

const styles = css`
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(16)};
`;

export const InputGroup = forwardRef<HTMLDivElement, InputGroupProps>(function InputGroup(
  { children, className, ...restProps },
  ref
) {
  return (
    <div {...restProps} className={classes(styles, className)} ref={ref}>
      {children}
    </div>
  );
});
