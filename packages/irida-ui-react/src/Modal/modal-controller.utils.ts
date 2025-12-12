import { ModalState } from "@irida-ui/core";
import React from "react";

export type ModalControllerContextType<S extends ModalState> = {
  state: S;
  onMount: (node: HTMLDialogElement | null) => void;
  closeModal: () => Promise<void>;
};

export const ModalControllerContext =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.createContext<ModalControllerContextType<any> | null>(null);
