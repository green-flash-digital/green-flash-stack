import type { ReactNode } from "react";
import { useSyncExternalStore } from "react";

import type { ModalEngine, ModalState } from "@stratum-ui/core";

import { ModalControllerContext } from "./modal.utils.js";
import type { ModalControllerOptions, ModalProps } from "./ModalController.js";

export type ModalProviderProps<S extends ModalState | undefined> = {
  engine: ModalEngine<S, ModalControllerOptions>;
  children: ReactNode;
  staticProps: ModalProps;
};

export function ModalProvider<S extends ModalState | undefined>({
  children,
  engine,
  staticProps
}: ModalProviderProps<S>) {
  const state = useSyncExternalStore(engine.subscribe, engine.getState, engine.getState);
  // `engine.launchOptions` holds whatever this modal's most recent `launch()` call
  // passed beyond `onClose` — merging it over the static construction-time props
  // is what lets a single call override size/variant/className/etc. for one open.
  const props = { ...staticProps, ...engine.launchOptions };

  return (
    <ModalControllerContext.Provider
      value={{
        state,
        props,
        closeModal: engine.closeModal,
        dismissModal: engine.dismissModal
      }}
    >
      {children}
    </ModalControllerContext.Provider>
  );
}
