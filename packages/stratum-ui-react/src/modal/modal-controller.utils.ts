import React from "react";

import type { ModalState } from "@stratum-ui/core";

export type ModalControllerContextType<S extends ModalState> = {
  state: S;
  onMount: (node: HTMLDialogElement | null) => void;
  closeModal: () => Promise<void>;
};

export const ModalControllerContext =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.createContext<ModalControllerContextType<any> | null>(null);
