import { usePopoverContext } from "../popover/popover.usePopoverContext.js";
import type { MenuState } from "./MenuController.js";

export function useMenuContext<T extends MenuState>() {
  const { closePopover: closeMenu, state } = usePopoverContext<T>();
  return {
    closeMenu,
    state
  };
}
