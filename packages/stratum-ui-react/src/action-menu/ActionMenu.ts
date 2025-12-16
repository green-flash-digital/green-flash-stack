import type { PopoverEngineState } from "@stratum-ui/core";

import type { PopoverOptions } from "../popover/Popover.js";
import { Popover } from "../popover/Popover.js";

export type ActionMenuState = PopoverEngineState;
export type ActionMenuOptions = Omit<PopoverOptions, "type">;

export class ActionMenu<S extends ActionMenuState> extends Popover<S> {
  constructor(options: ActionMenuOptions) {
    super({ type: "auto", ...options });
  }

  onMount<E extends HTMLElement>(e: E | null) {
    super.onMount(e);

    console.log("Mounting action menu");
  }
}
