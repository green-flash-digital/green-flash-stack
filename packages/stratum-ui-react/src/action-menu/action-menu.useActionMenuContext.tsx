import type { ActionMenuState } from "./ActionMenu.js";

import { usePopoverContext } from "../popover/popover.usePopoverContext.js";

export function useActionMenuContext<T extends ActionMenuState>() {
  const { closePopover: closeActionMenu, state } = usePopoverContext<T>();
  return {
    closeActionMenu,
    state,
  };
}
