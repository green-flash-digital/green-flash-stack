import { type RefCallback, useCallback, useRef } from "react";

import { ensurePopover, ensureTarget } from "./use-popover.utils.js";

export type FocusableElement =
  | HTMLButtonElement
  | HTMLAnchorElement
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement;

export type PopoverOptions = {
  /**
   * The ID of the popover. This ID is used for accessibility purposes to ensure
   * that dropdown and the target have the necessary aria-roles.
   */
  id: string;
};
export const usePopover = <
  PopoverNode extends HTMLElement,
  TargetNode extends FocusableElement = FocusableElement
>({
  id,
}: PopoverOptions) => {
  const popoverRef = useRef<PopoverNode | null>(null);
  const targetRef = useRef<TargetNode | null>(null);

  const setTargetRef = useCallback<RefCallback<TargetNode>>(
    (node) => {
      if (!node) return;
      targetRef.current = node;
      targetRef.current.setAttribute("aria-controls", id);
      targetRef.current.setAttribute("aria-expanded", "false");
    },
    [id]
  );

  const setPopoverRef = useCallback<RefCallback<PopoverNode>>(
    (node) => {
      if (!node) return;
      popoverRef.current = node;
      popoverRef.current.popover = "manual";
      popoverRef.current.id = id;
    },
    [id]
  );

  // Displays the popover and adds an "open" class to the popover
  const showPopover = useCallback(() => {
    const popover = popoverRef.current;
    const target = targetRef.current;
    if (!ensurePopover(popover) || !ensureTarget(target)) return;

    popover.showPopover();

    target.ariaExpanded = "true";
    popover.ariaExpanded = "true";

    if (popover.classList.contains("close")) {
      popover.classList.replace("close", "open");
    } else {
      popover.classList.add("open");
    }
  }, []);

  // Hides the popover after any animations associated with the class "close"
  // complete their execution
  const hidePopover = useCallback(async () => {
    const popover = popoverRef.current;
    const target = targetRef.current;
    if (!ensurePopover(popover) || !ensureTarget(target)) return;

    popover.classList.replace("open", "close");
    const animations = popover.getAnimations({
      subtree: true,
    });
    await Promise.allSettled(animations.map((animation) => animation.finished));

    popover.classList.replace("open", "close");
    popover.ariaExpanded = "false";
    popover.hidePopover();
  }, []);

  return {
    popoverRef,
    targetRef,
    setPopoverRef,
    setTargetRef,
    showPopover,
    hidePopover,
  };
};
