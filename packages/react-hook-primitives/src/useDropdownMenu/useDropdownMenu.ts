import type { RefCallback } from "react";
import { useId, useRef, useCallback, useMemo } from "react";



import { useDropdown } from "#/useDropdown/useDropdown.js";
import type { DropdownOptions } from "#/useDropdown/useDropdown.types.js";

import { LOG_UDM } from "./use-dropdown-menu.utils.js";



export type UseDropdownMenuArgs = DropdownOptions;
/**
 * A dropdown menu hook designed to be used with display menus
 * when a button is clicked
 */
export function useDropdownMenu<
  DropdownNode extends HTMLElement,
  AlignmentNode extends HTMLElement = HTMLElement
>(options?: UseDropdownMenuArgs) {
  const id = useId();
  const onWindowClickRef = useRef<((e: MouseEvent) => void) | null>(null);
  const onWindowKeydownRef = useRef<((e: KeyboardEvent) => void) | null>(null);
  const isMenuOpenRef = useRef(false);

  const {
    openDropdown,
    closeDropdown,
    setDropdownRef,
    setTargetRef: iSetTargetRef,
    targetRef,
    dropdownRef,
    alignmentRef,
  } = useDropdown<DropdownNode, HTMLButtonElement, AlignmentNode>(
    useMemo(
      () => ({
        id,
        dxArrow: options?.dxArrow,
        dxOffset: options?.dxOffset,
        dxPosition: options?.dxPosition,
      }),
      [id, options?.dxArrow, options?.dxOffset, options?.dxPosition]
    )
  );

  // Closes the menu and removes the listeners
  const handleClose = useCallback(() => {
    LOG_UDM.debug("Closing menu");

    isMenuOpenRef.current = false;

    const onWindowClick = onWindowClickRef.current;
    const onWindowKeydown = onWindowKeydownRef.current;
    if (!onWindowClick || !onWindowKeydown) return;

    // Remove event listeners
    LOG_UDM.debug("Removing window event listeners");
    window.removeEventListener("click", onWindowClick);
    window.removeEventListener("keydown", onWindowKeydown);

    closeDropdown();
  }, [closeDropdown]);

  // Opens the dropdown
  const handleOpen = useCallback(() => {
    LOG_UDM.debug("Opening menu");

    // Add a window listener to listen for a click and determine
    // if its a part of the dropdown or target or not
    function handleWindowClick(e: MouseEvent) {
      const isMenuOpen = isMenuOpenRef.current;
      const dropdown = dropdownRef.current;
      const target = targetRef.current;
      if (!dropdown || !target || !isMenuOpen) return;

      const clickedNode = e.target as Node;
      if (
        dropdown.contains(clickedNode) ||
        dropdown === clickedNode ||
        target.contains(clickedNode) ||
        target === clickedNode
      ) {
        return;
      }
      LOG_UDM.debug("External node to dropdown or target clicked. Moving");
      handleClose();
    }

    // Close the dropdown when the escape key is pressed
    function handleWindowKeydown(e: KeyboardEvent) {
      if (!isMenuOpenRef.current) return;
      if (e.key !== "Escape") return;
      LOG_UDM.debug("Escape key pressed. Closing menu");
      handleClose();
    }

    LOG_UDM.debug("Adding window event listeners to determine when to close");
    isMenuOpenRef.current = true;
    onWindowClickRef.current = handleWindowClick;
    onWindowKeydownRef.current = handleWindowKeydown;

    window.addEventListener("click", onWindowClickRef.current);
    window.addEventListener("keydown", onWindowKeydownRef.current);

    openDropdown();
  }, [dropdownRef, handleClose, openDropdown, targetRef]);

  /**
   * Toggle the visibility of the dropdown
   */
  const handleToggle = useCallback(() => {
    if (!targetRef.current) return;
    if (targetRef.current.classList.contains("open")) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [handleClose, handleOpen, targetRef]);

  const setTargetRef = useCallback<RefCallback<HTMLButtonElement>>(
    (node) => {
      if (!node) return;
      iSetTargetRef(node);

      // Toggle the dropdown when the target is clicked
      function handleClickTarget(e: MouseEvent) {
        LOG_UDM.debug("Target was clicked. Toggling dropdown visibility. ");
        e.stopPropagation();
        handleToggle();
      }

      // Add event listeners
      node.addEventListener("click", handleClickTarget);

      return () => {
        // Remove event listeners
        node.removeEventListener("click", handleClickTarget);
      };
    },
    [handleToggle, iSetTargetRef]
  );

  return useMemo(
    () => ({
      targetRef,
      dropdownRef,
      setDropdownRef,
      setTargetRef,
      closeMenu: handleClose,
      alignmentRef,
    }),
    [
      alignmentRef,
      dropdownRef,
      handleClose,
      setDropdownRef,
      setTargetRef,
      targetRef,
    ]
  );
}
