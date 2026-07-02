import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "@green-flash/ts-utils/isomorphic";

import { makeSpace, makeCustom, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type ModalFooterPropsNative = JSX.IntrinsicElements["footer"];
export type ModalFooterProps = ModalFooterPropsNative;

export const modalFooterClassName = "modal-footer";

const styles = css`
  display: flex;
  align-items: center;
  gap: ${makeSpace(16)};
  height: ${makeRem(80)};
  padding: 0 ${makeCustom("modal-gutters")};
  justify-content: flex-end;
`;

export const ModalFooter = forwardRef<HTMLElement, ModalFooterProps>(function ModalFooter(
  { children, className, ...restProps },
  ref
) {
  return (
    <footer {...restProps} className={classes(modalFooterClassName, styles, className)} ref={ref}>
      {children}
    </footer>
  );
});
