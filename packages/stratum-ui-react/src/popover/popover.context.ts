import type { PopoverEngineState } from "@stratum-ui/core";
import React from "react";

export type PopoverContextType<S extends PopoverEngineState> = {
  state: S;
  onMount: (node: HTMLDialogElement | null) => void;
  closeModal: () => Promise<void>;
};

export const PopoverContext =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.createContext<PopoverContextType<any> | null>(null);
