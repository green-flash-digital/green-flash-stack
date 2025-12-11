import { ModalState } from "@irida-ui/core";
import React, { useContext } from "react";

export type ModalControllerContextType<S extends ModalState> = {
  state: S;
  onMount: (node: HTMLDialogElement | null) => void;
  closeModal: () => Promise<void>;
};

export const ModalControllerContext =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.createContext<ModalControllerContextType<any> | null>(null);

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
