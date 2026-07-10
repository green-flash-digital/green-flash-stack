import React from "react";

import type { PopoverEngineState } from "@stratum-ui/core";

export type PopoverContextType<S extends PopoverEngineState> = {
  state: S;
  closePopover: () => Promise<void>;
};

export const PopoverContext =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.createContext<PopoverContextType<any> | null>(null);
