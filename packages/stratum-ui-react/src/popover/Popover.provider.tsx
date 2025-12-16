import { type ReactNode } from "react";
import { useSyncExternalStore } from "react";
import type { PopoverEngine, PopoverEngineState } from "@stratum-ui/core";

import type { Popover } from "./Popover.js";
import { PopoverContext } from "./popover.context.js";

export type PopoverProps<S extends PopoverEngineState | undefined> = {
  engine: PopoverEngine<S>;
  instance: Popover<S>;
  children: ReactNode;
};

export function PopoverProvider<S extends PopoverEngineState | undefined>({
  children,
  instance,
  engine,
}: PopoverProps<S>) {
  const state = useSyncExternalStore(
    engine.subscribe,
    engine.getState,
    engine.getState
  );

  return (
    <PopoverContext.Provider
      value={{
        state,
        onMount: instance.onMount,
        closeModal: instance.closePopover,
      }}
    >
      {children}
    </PopoverContext.Provider>
  );
}
