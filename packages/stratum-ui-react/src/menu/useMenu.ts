import { useCallback, useEffect, useRef } from "react";

import type { PopoverEngineState } from "@stratum-ui/core";

import type { UsePopoverOptions } from "../popover/usePopover.js";
import { usePopover } from "../popover/usePopover.js";

export type UseMenuOptions = Omit<UsePopoverOptions, "type">;

const TYPEAHEAD_RESET_MS = 500;

/**
 * Dropdown/menu semantics on top of `usePopover`: `role="menu"`/`"menuitem"`,
 * arrow-key + Home/End navigation, first-letter typeahead, `aria-haspopup`/
 * `aria-expanded` wiring, and focus moving to the first item on open. Escape
 * and click-outside dismissal, plus focus returning to the trigger on close,
 * are already handled generically by the underlying `PopoverEngine` — nothing
 * menu-specific needed there.
 *
 * `triggerRef`/`menuRef`/`getItemRef` attach everything (attributes, click,
 * keyboard nav) imperatively via native listeners on the node — apply the ref
 * and nothing else is required. That also sidesteps needing to cast a React
 * `SyntheticEvent` to a DOM `Event` for the engine's methods, since native
 * listeners hand you a real one.
 *
 * Always forces `type: "auto"` — a menu's trigger is a click-to-toggle button
 * (`showPopover()`, which `open` would call, throws if already open), so
 * light-dismiss is the only sensible mode here.
 */
export function useMenu<S extends PopoverEngineState | undefined = undefined>(
  options: UseMenuOptions = {}
) {
  const popover = usePopover<S>({ ...options, type: "auto" });
  const { engine, popoverRef, state } = popover;
  const isOpen = state.isOpen;
  const itemsRef = useRef<(HTMLElement | null)[]>([]);
  const typeahead = useRef({ query: "", timer: 0 });

  useEffect(() => {
    if (!isOpen) return;
    itemsRef.current.find(Boolean)?.focus();
  }, [isOpen]);

  const focusItemAt = useCallback((index: number) => {
    const items = itemsRef.current.filter((item): item is HTMLElement => item !== null);
    if (items.length === 0) return;
    const wrapped = ((index % items.length) + items.length) % items.length;
    items[wrapped]?.focus();
  }, []);

  const handleTypeahead = useCallback((key: string) => {
    if (key.length !== 1) return false;
    const items = itemsRef.current.filter((item): item is HTMLElement => item !== null);
    if (items.length === 0) return false;

    window.clearTimeout(typeahead.current.timer);
    typeahead.current.query += key.toLowerCase();
    const query = typeahead.current.query;
    typeahead.current.timer = window.setTimeout(() => {
      typeahead.current.query = "";
    }, TYPEAHEAD_RESET_MS);

    const match = items.find((item) => (item.textContent ?? "").trim().toLowerCase().startsWith(query));
    match?.focus();
    return true;
  }, []);

  const onMenuKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const items = itemsRef.current.filter((item): item is HTMLElement => item !== null);
      const currentIndex = items.indexOf(document.activeElement as HTMLElement);

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          focusItemAt(currentIndex + 1);
          return;
        case "ArrowUp":
          e.preventDefault();
          focusItemAt(currentIndex - 1);
          return;
        case "Home":
          e.preventDefault();
          focusItemAt(0);
          return;
        case "End":
          e.preventDefault();
          focusItemAt(items.length - 1);
          return;
        default:
          if (handleTypeahead(e.key)) e.preventDefault();
      }
    },
    [focusItemAt, handleTypeahead]
  );

  /**
   * Ref for the trigger button. Re-runs whenever `isOpen` changes (that's the
   * dependency array doing double duty — it's what keeps `aria-expanded` in
   * sync, since a callback ref only fires on attach/detach by itself).
   */
  const triggerRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      node.setAttribute("aria-haspopup", "menu");
      node.setAttribute("aria-expanded", String(isOpen));
      const onClick = (e: Event) => engine.togglePopover(e);
      node.addEventListener("click", onClick);
      return () => node.removeEventListener("click", onClick);
    },
    [engine, isOpen]
  );

  /** Ref for the menu container — wraps `popoverRef` and adds `role="menu"` + keyboard nav. */
  const menuRef = useCallback(
    (node: HTMLElement | null) => {
      popoverRef(node);
      if (!node) return;
      node.setAttribute("role", "menu");
      node.addEventListener("keydown", onMenuKeyDown);
      return () => node.removeEventListener("keydown", onMenuKeyDown);
    },
    [popoverRef, onMenuKeyDown]
  );

  /** Ref for a single menu item, in rendered order — `getItemRef(index)`. */
  const getItemRef = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      itemsRef.current[index] = node;
      if (!node) return;
      node.setAttribute("role", "menuitem");
      node.tabIndex = -1;
    },
    []
  );

  return {
    engine: popover.engine,
    state: popover.state,
    shouldRenderContent: popover.shouldRenderContent,
    open: popover.open,
    close: popover.close,
    toggle: popover.toggle,
    Content: popover.Content,
    preload: popover.preload,
    triggerRef,
    menuRef,
    getItemRef
  };
}
