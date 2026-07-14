import { useContext } from "react";

import type { ModalState } from "@stratum-ui/core";

import type { ModalControllerContextType } from "./modal.utils.js";
import { ModalControllerContext } from "./modal.utils.js";

export function useModalContext<
  S extends ModalState = ModalState
>(): ModalControllerContextType<S> {
  const context = useContext(ModalControllerContext);
  if (!context) {
    throw new Error("'useModalContext()' must be used within a <ModalProvider /> component");
  }
  return context;
}
