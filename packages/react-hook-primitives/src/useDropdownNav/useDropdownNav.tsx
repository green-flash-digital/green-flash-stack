import type { RefCallback } from "react";
import { useCallback, useId, useMemo, useRef } from "react";



import type { DropdownOptions } from "#/useDropdown/useDropdown.types.js";
import { useDropdown } from "#/useDropdown/useDropdown.js";

import { LOG_UDN } from "./use-dropdown-nav.utils.js";



export type UseDropdownNavArgs = DropdownOptions;

export function useDropdownNav<DropdownNode extends HTMLElement>(
  options?: UseDropdownNavArgs
) {
  const id = useId();
  const onWindowClickRef = useRef<((e: MouseEvent) => void) | null>(null);
  const onWindowKeydownRef = useRef<((e: KeyboardEvent) => void) | null>(null);
  const isMenuOpenRef = useRef(false);

  const {
    openDropdown,
    closeDropdown,
    setDropdownRef,
    setTargetRef: setDropdownTargetRef,
    dropdownRef,
    targetRef,
  } = useDropdown<DropdownNode, HTMLButtonElement>(
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

  /**
   * Closes the navMenu and removes the global
   * event listeners
   */
  const closeNavMenu = useCallback(async () => {
    LOG_UDN.debug("Closing nav menu");

    const onWindowClick = onWindowClickRef.current;
    const onWindowKeydown = onWindowKeydownRef.current;
    if (!onWindowClick || !onWindowKeydown) return;

    // Remove event listeners
    LOG_UDN.debug("Removing window event listeners");
    window.removeEventListener("click", onWindowClick);
    window.removeEventListener("keydown", onWindowKeydown);

    // Close the menu
    await closeDropdown();
    isMenuOpenRef.current = false;
  }, [closeDropdown]);

  /**
   * Opens the nav menu and adds some window listeners to
   * detect when the nav menu should close
   */
  const openNavMenu = useCallback(() => {
    LOG_UDN.debug("Opening nav menu");

    // Listen to see if the user pressed the escape key
    function handleWindowKeydown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      closeNavMenu();
    }

    // Listen to any clicks and determine if the menu should close
    function handleWindowClick(e: MouseEvent) {
      const dropdown = dropdownRef.current;
      const target = targetRef.current;
      if (!dropdown || !target) return;

      const clickedNode = e.target as HTMLElement;

      // Check if the clicked element an anchor tag or is
      // an element that is a descendent of an anchor tag
      const anchorTags = Array.from(
        dropdownRef.current?.getElementsByTagName("a") ?? []
      );
      for (const anchorTag of anchorTags) {
        if (anchorTag === clickedNode || anchorTag.contains(clickedNode)) {
          return closeNavMenu();
        }
      }

      // Check if the clicked element is a child of the target
      // or is a child of the dropdown. If it does then we're not
      // going to do anything.
      if (dropdown.contains(clickedNode) || target.contains(clickedNode)) {
        return;
      }

      closeNavMenu();
    }

    // Set listeners to their respective refs
    onWindowClickRef.current = handleWindowClick;
    onWindowKeydownRef.current = handleWindowKeydown;

    // Add event listeners
    window.addEventListener("keydown", handleWindowKeydown);
    window.addEventListener("click", handleWindowClick);

    // Open the nav menu
    isMenuOpenRef.current = true;
    openDropdown();
  }, [closeNavMenu, dropdownRef, openDropdown, targetRef]);

  /**
   * Opens or closes the menu based upon the
   * state of the nav menu
   */
  const toggleNavMenu = useCallback(() => {
    if (isMenuOpenRef.current) {
      return closeNavMenu();
    }
    return openNavMenu();
  }, [closeNavMenu, openNavMenu]);

  /**
   * A ref callback to set the dropdown target and add some
   * default functionality to the dropdown target
   */
  const setTargetRef = useCallback<RefCallback<HTMLButtonElement>>(
    (node) => {
      if (!node) return;
      setDropdownTargetRef(node);

      // Listen for a keydown event on the nav menu target
      function handleOnKeydown(e: KeyboardEvent) {
        switch (e.key) {
          case "Enter":
          case " ": // space
          case "ArrowDown":
            e.preventDefault(); // prevent the click event from also firing
            toggleNavMenu();
            break;

          default:
            break;
        }
      }

      // Toggle the nav menu open and closed when clicked
      function handleOnClick() {
        toggleNavMenu();
      }

      // Add the event listeners to the target
      node.addEventListener("keydown", handleOnKeydown);
      node.addEventListener("click", handleOnClick);

      // Remove the event listeners on cleanup
      return () => {
        node.removeEventListener("keydown", handleOnKeydown);
        node.removeEventListener("click", handleOnClick);
      };
    },
    [setDropdownTargetRef, toggleNavMenu]
  );

  return {
    targetRef,
    navMenuRef: dropdownRef,
    setTargetRef,
    setNavMenuRef: setDropdownRef,
  };
}
