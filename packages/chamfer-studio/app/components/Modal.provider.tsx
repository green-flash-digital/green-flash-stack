import { type RefCallback, type ReactNode, useContext, useMemo } from "react";
import React, { useSyncExternalStore } from "react";

import type { DialogState } from "./DialogEngine";
import type { ModalEngine, ModalState } from "./Modal.engine";

type ModalContextType<S extends ModalState> = Pick<ModalEngine<S>, "open" | "close"> & {
  state: S;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ModalContext = React.createContext<ModalContextType<any> | null>(null);

export type ModalProviderProps<S extends ModalState> = {
  dxEngine: ModalEngine<S>;
  dxOnMount?: RefCallback<HTMLDialogElement>;
  children: ReactNode;
};

export function ModalProvider<S extends ModalState>({ children, dxEngine }: ModalProviderProps<S>) {
  const queue = dxEngine.getQueue();
  const state = useSyncExternalStore(queue.subscribe, queue.getSnapshot, queue.getSnapshot);

  const value = useMemo(
    () => ({
      state,
      open: dxEngine.open,
      close: dxEngine.close
    }),
    [dxEngine.close, dxEngine.open, state]
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModalContext<S extends DialogState = DialogState>(): ModalContextType<S> {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("'useModalContext()' must be used within a <ModalProvide /> component");
  }
  return context;
}
