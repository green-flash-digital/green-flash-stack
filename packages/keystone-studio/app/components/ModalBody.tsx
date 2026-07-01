import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { makeCustom } from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type ModalBodyPropsNative = JSX.IntrinsicElements["div"];
export type ModalBodyPropsCustom = {
  dxNoGutters?: boolean;
};
export type ModalBodyProps = ModalBodyPropsNative & ModalBodyPropsCustom;

export const modalBodyClassName = "modal-body";

const styles = css`
  padding: 0 ${makeCustom("modal-gutters")};
`;

export const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(function ModalBody(
  { children, className, ...restProps },
  ref
) {
  return (
    <div {...restProps} className={classes(modalBodyClassName, styles, className)} ref={ref}>
      {children}
    </div>
  );
});
