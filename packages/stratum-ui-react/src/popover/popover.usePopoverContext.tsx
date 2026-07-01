import { useContext } from "react";

import type { PopoverEngineState } from "@stratum-ui/core";

import { PopoverContext, type PopoverContextType } from "./popover.context.js";

export function usePopoverContext<
  S extends PopoverEngineState = PopoverEngineState
>(): PopoverContextType<S> {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error("'usePopoverContext()' must be used within a <PopoverProvider /> component");
  }
  return context;
}
