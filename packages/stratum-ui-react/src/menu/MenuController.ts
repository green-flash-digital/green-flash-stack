import type { PopoverEngineState } from "@stratum-ui/core";

import type { PopoverOptions } from "../popover/Popover.js";
import { Popover } from "../popover/Popover.js";

export type MenuState = PopoverEngineState;
export type MenuOptions = Omit<PopoverOptions, "type">;

export class MenuController<S extends MenuState | undefined> extends Popover<S> {
  constructor(options: MenuOptions) {
    super({ type: "auto", ...options });
  }
}
