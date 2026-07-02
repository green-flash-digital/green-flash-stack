import type { RefCallback } from "react";
import { useId, useRef, useMemo, useCallback, useState } from "react";

import type { DropdownOptions } from "#/useDropdown/useDropdown.types.js";
import type { UseDropdownOptions } from "#/useDropdown/useDropdown.js";
import { useDropdown } from "#/useDropdown/useDropdown.js";

export type UseDropdownInputArgs = DropdownOptions & {
  /**
   * A provided ID that will overwrite the ID that is created internally.
   */
  dxId?: string;
};

export function useDropdownInput<
  DropdownNode extends HTMLElement,
  TargetNode extends HTMLInputElement
>(options: UseDropdownInputArgs) {
  const id = useId();
  const isDropdownOpenRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const clickedNodeRef = useRef<HTMLElement | null>(null);
  const onPointerDownRef = useRef<((e: MouseEvent) => void) | null>(null);
  const onFocusOutRef = useRef<((e: FocusEvent) => void) | null>(null);

  const {
    openDropdown,
    setDropdownRef: setInnerDropdownRef,
    setTargetRef: setInnerTargetRef,
    closeDropdown,
    dropdownRef,
    targetRef,
  } = useDropdown<DropdownNode, TargetNode>(
    useMemo<UseDropdownOptions>(
      () => ({
        id: options?.dxId ?? id,
        dxPosition: options.dxPosition,
        dxArrow: options.dxArrow,
        dxOffset: options.dxOffset,
      }),
      [id, options.dxId, options.dxArrow, options.dxOffset, options.dxPosition]
    )
  );

  const closeInputMenu = useCallback(async () => {
    const container = containerRef.current;
    const onPointerDown = onPointerDownRef.current;
    const onFocusOut = onFocusOutRef.current;
    if (!container || !onPointerDown || !onFocusOut) return;

    // Close the dropdown
    await closeDropdown();
    isDropdownOpenRef.current = false;
    setIsOpen(false);

    // remove the event listeners
    window.removeEventListener("pointerdown", onPointerDown);
    container.removeEventListener("focusout", onFocusOut);
  }, [closeDropdown]);

  const openInputMenu = useCallback(() => {
    if (isDropdownOpenRef.current) return;
    setIsOpen(true);
  }, []);

  const setInputMenuRef = useCallback<RefCallback<DropdownNode>>(
    (node) => {
      if (!node) return;
      dropdownRef.current = node;
      setInnerDropdownRef(node);

      const target = targetRef.current;
      const dropdown = dropdownRef.current;
      const container = containerRef.current;
      if (!dropdown || !target || !container) return;

      // Set the min-width of the dropdown to the width of the target
      // (in this case it's going to be the input)
      dropdown.style.setProperty("min-width", `${target.clientWidth}px`);

      isDropdownOpenRef.current = true;
      openDropdown();

      // Track the last clicked node
      // NOTE: By default, pointerdown always fires first in the event listener stack
      function handlePointerDown(e: MouseEvent) {
        const container = containerRef.current;
        if (!container) return;

        clickedNodeRef.current = e.target as HTMLElement;
        if (container.contains(clickedNodeRef.current)) return;

        closeInputMenu();
      }

      // Close the dropdown if we focus outside of the container but wait
      // for the next tick of the browser
      function handleFocusOut(e: FocusEvent) {
        setTimeout(() => {
          // Ensure the container has a ref and that the dropdown is open
          const container = containerRef.current;
          const isDropdownOpen = isDropdownOpenRef.current;
          if (!container || !isDropdownOpen) return;

          const containsClickedNode = container.contains(
            clickedNodeRef.current
          ); // click events
          const containsActiveNode = container.contains(document.activeElement); // all browsers
          const containsRelatedNode = container.contains(
            e.relatedTarget as Node
          ); // chrome || webkit browsers

          // Don't do anything. The focus still remains within the container
          if (
            containsClickedNode ||
            containsActiveNode ||
            containsRelatedNode
          ) {
            return;
          }

          closeInputMenu();
        }, 0);
      }

      // Add the event listeners
      onPointerDownRef.current = handlePointerDown;
      onFocusOutRef.current = handleFocusOut;

      window.addEventListener("pointerdown", handlePointerDown);
      container.addEventListener("focusout", handleFocusOut);
    },
    [dropdownRef, closeInputMenu, openDropdown, setInnerDropdownRef, targetRef]
  );

  const setTargetRef = useCallback<RefCallback<TargetNode>>(
    (node) => {
      if (!node) return;
      setInnerTargetRef(node);

      function handleOnFocus() {
        openInputMenu();
      }

      // Add event listeners
      node.addEventListener("focus", handleOnFocus);

      // Remove event listeners
      return () => {
        node.removeEventListener("focus", handleOnFocus);
      };
    },
    [openInputMenu, setInnerTargetRef]
  );

  return {
    // TODO: Get rid of the container ref in favor of granular
    containerRef,
    inputMenuRef: dropdownRef,
    targetRef,
    setInputMenuRef,
    setTargetRef,
    closeInputMenu,
    openInputMenu,
    isOpen,
  };
}
