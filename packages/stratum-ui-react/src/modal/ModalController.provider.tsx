import { type RefCallback, type ReactNode } from "react";
import { useSyncExternalStore } from "react";

import type { ModalEngine, ModalState } from "@stratum-ui/core";

import { ModalControllerContext } from "./modal-controller.utils.js";

export type ModalControllerProps<S extends ModalState | undefined> = {
  engine: ModalEngine<S>;
  dxOnMount?: RefCallback<HTMLDialogElement>;
  children: ReactNode;
};

export function ModalControllerProvider<S extends ModalState | undefined>({
  children,
  engine
}: ModalControllerProps<S>) {
  const state = useSyncExternalStore(engine.subscribe, engine.getState, engine.getState);

  return (
    <ModalControllerContext.Provider
      value={{
        state,
        onMount: engine.onMount,
        closeModal: engine.closeModal
      }}
    >
      {children}
    </ModalControllerContext.Provider>
  );
}
