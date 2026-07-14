import { useCallback } from "react";

import type { PopoverEngineState } from "@stratum-ui/core";

import type { UsePopoverOptions } from "../popover/usePopover.js";
import { usePopover } from "../popover/usePopover.js";

export type UseToggletipOptions = Omit<UsePopoverOptions, "type">;

/**
 * Click-revealed status content on top of `usePopover` — Heydon Pickering's
 * "toggletip" pattern (see https://inclusive-components.design/tooltips-toggletips/),
 * distinct from `useTooltip` in both trigger and ARIA shape:
 *
 * - Triggered by a **click**, not hover — the button is a control in its own
 *   right (typically a standalone "i" icon), not a label for something else.
 * - The revealed content is `role="status"` (a live region), not
 *   `role="tooltip"`/`aria-describedby`. `aria-describedby` would let a screen
 *   reader announce the content the instant the trigger receives focus —
 *   before it's even clicked — making the click appear to do nothing. A live
 *   region only announces once populated, which happens naturally the moment
 *   the popover opens (nothing renders inside it while closed).
 *
 * Still non-interactive content only, same as tooltips — if what you're
 * revealing needs its own focusable controls, this isn't the right pattern
 * for it either.
 *
 * Forces `type: "auto"` — light-dismiss (click-outside, Escape) is exactly
 * "dismissed by clicking outside, pressing Escape, or unfocusing" per the
 * article, which is what `type: "auto"` already gives for free.
 */
export function useToggletip<S extends PopoverEngineState | undefined = undefined>(
  options: UseToggletipOptions = {}
) {
  const popover = usePopover<S>({ ...options, type: "auto" });
  const { engine, popoverRef, state } = popover;
  const isOpen = state.isOpen;

  /** Ref for the toggle button — click-to-toggle, `aria-expanded` kept in sync. */
  const triggerRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      node.setAttribute("aria-expanded", String(isOpen));
      const onClick = (e: Event) => engine.togglePopover(e);
      node.addEventListener("click", onClick);
      return () => node.removeEventListener("click", onClick);
    },
    [engine, isOpen]
  );

  /** Ref for the revealed content — wraps `popoverRef` and sets `role="status"`. */
  const contentRef = useCallback(
    (node: HTMLElement | null) => {
      popoverRef(node);
      if (!node) return;
      node.setAttribute("role", "status");
    },
    [popoverRef]
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
    contentRef
  };
}
