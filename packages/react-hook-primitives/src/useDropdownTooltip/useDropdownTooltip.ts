import { type RefCallback, useCallback, useId, useMemo } from "react";

import { exhaustiveMatchGuard } from "@green-flash/ts-utils/isomorphic";

import { type DropdownOptions, useDropdown } from "#/useDropdown/index.js";
import { isDropdownOpen } from "#/useDropdown/useDropdown.utils.js";

import { LOG_UDT } from "./use-dropdown-tooltip.utils.js";

export type UseTooltipOptionsTooltip = DropdownOptions & {
  /**
   * A tooltip can take on 1 of 2 forms:
   *
   * ## Form 1: A simple label
   *
   * Tooltip exists as a label that describes a control. It is intended
   * to be a simple description of the control that otherwise would have
   * a visible label but otherwise is hidden due to design or space.
   * @example "Notifications"
   *
   * ## Form 2: A clarification
   *
   * Tooltip exists as an extra clarification for a control. Provides
   * supplementary descriptions or text to better guide the user
   * on how to do something with a particular control
   * @example "View notifications and manage settings"
   */
  dxType: "tooltip";
  /**
   * This is an accessibility control that helps further context
   * what the screen reader is going to interpret. This field can be many node
   * IDs delimited by a space which should be read semantically by the screen reader.
   *
   * Let's say that there is a tooltip that has "Likes" as it's content
   * but it also has a bubble or a burst icon inside of it that details how
   * many likes there are. In this case, we need to supply another id that _labels_
   * the tooltip; let's call it "likes-count". In order for screen readers to
   * appropriately read the tooltip and the context, it needs to understand
   * which nodes with IDs label the focusable element.
   *
   * In this case we would put `likes-count likes-label` where the screen reader
   * would read "3 Likes"
   *
   * @default `the auto generated id of the dropdown ref`
   */
  dxLabeledBy?: string;
};
export type UseTooltipOptionsToggleTip = DropdownOptions & {
  dxType: "toggletip";
};

export type UseTooltipOptions = UseTooltipOptionsTooltip | UseTooltipOptionsToggleTip;

export const useDropdownTooltip = <
  DropdownNode extends HTMLElement,
  TargetNode extends HTMLButtonElement | HTMLAnchorElement | HTMLInputElement
>(
  options: UseTooltipOptions
) => {
  const id = useId();
  const memoOptions = useMemo(
    () => ({
      id,
      ...options
    }),
    [id, options]
  );
  const {
    dropdownRef,
    targetRef,
    setDropdownRef,
    setTargetRef: setDropdownTargetRef,
    openDropdown,
    closeDropdown
  } = useDropdown<DropdownNode, TargetNode>(memoOptions);

  const setTargetRef = useCallback<RefCallback<TargetNode>>(
    (node) => {
      if (!node) return;

      // Set the dropdown target
      setDropdownTargetRef(node);
      const target = node;

      // Set some listeners based upon the type
      switch (memoOptions.dxType) {
        case "tooltip": {
          function handleFocus() {
            openDropdown();
          }
          function handleBlur() {
            closeDropdown();
          }
          function handleMouseEnter() {
            openDropdown();
          }
          function handleMouseLeave() {
            closeDropdown();
          }

          LOG_UDT.debug("Adding target event listeners");
          target.addEventListener("focus", handleFocus);
          target.addEventListener("blur", handleBlur);
          target.addEventListener("mouseenter", handleMouseEnter);
          target.addEventListener("mouseleave", handleMouseLeave);
          target.setAttribute("aria-labelledby", memoOptions.dxLabeledBy ?? memoOptions.id);

          return () => {
            LOG_UDT.debug("Removing target event listeners");
            target.removeEventListener("focus", handleFocus);
            target.removeEventListener("blur", handleBlur);
            target.removeEventListener("mouseenter", handleMouseEnter);
            target.removeEventListener("mouseleave", handleMouseLeave);
          };
        }

        case "toggletip": {
          function handleClick() {
            if (isDropdownOpen(dropdownRef.current)) {
              return closeDropdown();
            }
            return openDropdown();
          }

          // Close the tooltip when the dropdown is open
          // and the Escape key is pressed
          function handleKeyDown(e: globalThis.KeyboardEvent) {
            e.stopImmediatePropagation();
            if (e.key !== "Escape") return;
            if (!isDropdownOpen(dropdownRef.current)) return;
            closeDropdown();
          }

          // Close the toggletip if the dropdown is open
          // and the clicked target is outside of the scope of the target or dropdown
          function handleWindowClick(e: globalThis.MouseEvent) {
            e.stopImmediatePropagation();
            const dropdown = dropdownRef.current;
            const target = targetRef.current;
            const clickedTarget = e.target as Node;

            if (!dropdown || !target) return;
            if (!isDropdownOpen(dropdown)) return;

            const clickedTargetIsDropdown = clickedTarget === dropdown;
            const clickedTargetIsInDropdown = dropdown.contains(clickedTarget);
            const clickedTargetIsTarget = clickedTarget === target;
            const clickedTargetIsInTarget = target.contains(clickedTarget);

            if (
              clickedTargetIsDropdown ||
              clickedTargetIsInDropdown ||
              clickedTargetIsTarget ||
              clickedTargetIsInTarget
            ) {
              return;
            }

            closeDropdown();
          }

          LOG_UDT.debug("Adding target event listeners");
          target.addEventListener("click", handleClick);
          window.addEventListener("keydown", handleKeyDown);
          window.addEventListener("click", handleWindowClick);

          return () => {
            LOG_UDT.debug("Removing target event listeners");
            target.removeEventListener("click", handleClick);
            window.removeEventListener("keydown", handleKeyDown);
            window.addEventListener("click", handleWindowClick);
          };
        }

        default:
          exhaustiveMatchGuard(memoOptions);
      }
    },
    [closeDropdown, dropdownRef, memoOptions, openDropdown, setDropdownTargetRef, targetRef]
  );

  const setTooltipRef = useCallback<RefCallback<DropdownNode>>(
    (node) => {
      if (!node) return;

      setDropdownRef(node);
      const dropdown = node;

      // add a few more styles specific to the dropdown version of the popover
      dropdown.style.position = "fixed";
      dropdown.style.inset = "unset";
      dropdown.role = "tooltip";
      if (!dropdown.id) {
        dropdown.id = id;
      }
    },
    [id, setDropdownRef]
  );

  return useMemo(
    () => ({
      setTargetRef,
      setTooltipRef,
      tooltipRef: dropdownRef,
      targetRef
    }),
    [dropdownRef, setTargetRef, setTooltipRef, targetRef]
  );
};
