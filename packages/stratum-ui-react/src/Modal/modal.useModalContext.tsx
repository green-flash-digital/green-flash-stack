import { ModalState } from "@stratum-ui/core";
import { useContext } from "react";
import {
  ModalControllerContextType,
  ModalControllerContext,
} from "./modal-controller.utils.js";

export function useModalContext<
  S extends ModalState = ModalState
>(): ModalControllerContextType<S> {
  const context = useContext(ModalControllerContext);
  if (!context) {
    throw new Error(
      "'useModalContext()' must be used within a <ModalControllerProvider /> component"
    );
  }
  return context;
}
