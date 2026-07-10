import { classes } from "@stratum-ui/core";
import type { JSX } from "react/jsx-runtime";

import { useModalContext } from "./modal.useModalContext.js";
import type { ModalSize, ModalVariants } from "./modal.utils.js";
import { modalStylesRoot, modalStyleVariants } from "./modal.utils.js";

export type ModalProps = Omit<JSX.IntrinsicElements["dialog"], "ref"> & {
  cxVariant?: ModalVariants;
  cxSize?: ModalSize;
};

export function Modal({
  cxSize = "md",
  cxVariant = "modal",
  className,
  children,
  ...restProps
}: ModalProps) {
  const { onMount } = useModalContext();
  return (
    <dialog
      {...restProps}
      className={classes(modalStylesRoot, modalStyleVariants[cxVariant], cxSize, className)}
      ref={onMount}
    >
      {children}
    </dialog>
  );
}
