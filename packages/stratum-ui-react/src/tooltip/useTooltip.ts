import { useCallback, useEffect, useId, useRef } from "react";

import type { PopoverEngineState } from "@stratum-ui/core";

import type { UsePopoverOptions } from "../popover/usePopover.js";
import { usePopover } from "../popover/usePopover.js";

export type UseTooltipOptions = Omit<UsePopoverOptions, "type"> & {
  /**
   * Delay in ms before showing on hover, to avoid flashing on every incidental
   * mouse pass. Keyboard focus always opens immediately — a delay only makes
   * sense as a hover-intent debounce, not as a tax on keyboard users.
   * @default 300
   */
  openDelay?: number;
};

/**
 * Non-interactive hint content on top of `usePopover`: `role="tooltip"`,
 * `aria-describedby` wiring so assistive tech announces the tooltip when the
 * trigger receives focus (not just on hover, which AT can't see), and
 * hover-intent delay on mouse but not on keyboard focus.
 *
 * `triggerRef`/`tooltipRef` attach everything imperatively via native
 * listeners — apply the ref and nothing else is required, and native events
 * flow straight into the engine's `Event`-typed methods with no casting.
 *
 * Always forces `type: "hint"` — dismissed automatically when hover/focus
 * leaves, and can layer over an already-open "auto" popover/menu rather than
 * closing it, which is exactly tooltip behavior.
 *
 * This is for non-interactive labels only — if the popped-up content needs to
 * be focusable/clickable, use `useToggletip` instead (WAI-ARIA advises against
 * interactive content inside `role="tooltip"`).
 */
export function useTooltip<S extends PopoverEngineState | undefined = undefined>(
  options: UseTooltipOptions = {}
) {
  const { openDelay = 300, ...rest } = options;
  const popover = usePopover<S>({ ...rest, type: "hint" });
  const { engine, popoverRef } = popover;
  const tooltipId = useId();
  const showTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(showTimer.current), []);

  const openNow = useCallback(
    (e: Event) => {
      window.clearTimeout(showTimer.current);
      engine.openPopover(e);
    },
    [engine]
  );

  const openAfterDelay = useCallback(
    (e: Event) => {
      window.clearTimeout(showTimer.current);
      const target = e.currentTarget;
      showTimer.current = window.setTimeout(() => {
        engine.openPopover({ currentTarget: target } as unknown as Event);
      }, openDelay);
    },
    [engine, openDelay]
  );

  const close = useCallback(() => {
    window.clearTimeout(showTimer.current);
    void engine.closePopover();
  }, [engine]);

  /** Ref for the trigger element — hover-intent + focus/blur wiring, aria-describedby. */
  const triggerRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      node.setAttribute("aria-describedby", tooltipId);
      node.addEventListener("mouseenter", openAfterDelay);
      node.addEventListener("mouseleave", close);
      node.addEventListener("focus", openNow);
      node.addEventListener("blur", close);
      return () => {
        node.removeEventListener("mouseenter", openAfterDelay);
        node.removeEventListener("mouseleave", close);
        node.removeEventListener("focus", openNow);
        node.removeEventListener("blur", close);
      };
    },
    [tooltipId, openAfterDelay, close, openNow]
  );

  /** Ref for the tooltip content — wraps `popoverRef` and adds `role="tooltip"` + its id. */
  const tooltipRef = useCallback(
    (node: HTMLElement | null) => {
      popoverRef(node);
      if (!node) return;
      node.id = tooltipId;
      node.setAttribute("role", "tooltip");
    },
    [popoverRef, tooltipId]
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
    tooltipId,
    triggerRef,
    tooltipRef
  };
}
