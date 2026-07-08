import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { makeSpace, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type ButtonGroupPropsNative = JSX.IntrinsicElements["div"];
export type ButtonGroupProps = ButtonGroupPropsNative;

const styles = css`
  display: flex;
  gap: 0;

  & > button {
    border-radius: 0 !important;

    &:not(:last-of-type) {
      border-right: 0 !important;

      & > button {
        &:nth-of-type(2) {
          border-right: 0;
        }
      }
    }
    &:first-of-type {
      border-top-left-radius: ${makeSpace(4)} !important;
      border-bottom-left-radius: ${makeSpace(4)} !important;

      & > button {
        &:nth-of-type(1) {
          border-top-left-radius: ${makeSpace(4)} !important;
          border-bottom-left-radius: ${makeSpace(4)} !important;
        }
        &:nth-of-type(2) {
          border-radius: 0;
        }
      }
    }
    &:last-of-type {
      border-top-right-radius: ${makeSpace(4)} !important;
      border-bottom-right-radius: ${makeSpace(4)} !important;

      & > button {
        &:nth-of-type(1) {
          border-radius: 0;
        }
        &:nth-of-type(2) {
          border-top-right-radius: ${makeSpace(4)} !important;
          border-bottom-right-radius: ${makeSpace(4)} !important;
        }
      }
    }
  }
`;

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { children, className, ...restProps },
  ref
) {
  return (
    <div {...restProps} className={classes(styles, className)} ref={ref}>
      {children}
    </div>
  );
});
