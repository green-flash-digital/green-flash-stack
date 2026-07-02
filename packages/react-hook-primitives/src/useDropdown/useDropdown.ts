import { type RefCallback, useCallback, useMemo, useRef } from "react";

import type { FocusableElement } from "#/usePopover/usePopover.js";
import { usePopover } from "#/usePopover/usePopover.js";

import type { DropdownOptions } from "./useDropdown.types.js";
import {
  processDropdownOptions,
  setDropdownPositionStyles,
} from "./useDropdown.utils.js";





export type UseDropdownHandleOpen = (e?: React.MouseEvent) => void;

export type DropdownRef = {
  handleOpen: UseDropdownHandleOpen;
  handleClose: () => void;
};

export type UseDropdownOptions = DropdownOptions & { id: string };

export const useDropdown = <
  DropdownNode extends HTMLElement,
  TargetNode extends FocusableElement,
  AlignmentNode extends HTMLElement = HTMLElement
>(
  options: UseDropdownOptions
) => {
  const {
    popoverRef,
    targetRef,
    setPopoverRef,
    setTargetRef,
    showPopover,
    hidePopover,
  } = usePopover<DropdownNode, TargetNode>({ id: options.id });
  const alignmentRef = useRef<AlignmentNode | null>(null);

  const memoOptions = useMemo(() => options, [options]);

  const setDropdownRef = useCallback<RefCallback<DropdownNode>>(
    (node) => {
      if (!node) return;

      // TODO: Refine this to include strategy
      node.style.position = "fixed";
      node.style.inset = "unset";
      setPopoverRef(node);
    },
    [setPopoverRef]
  );

  const openDropdown = useCallback<UseDropdownHandleOpen>(() => {
    const popover = popoverRef.current;
    const target = targetRef.current;
    if (!popover || !target) return;

    // apply the options either from the hook or
    // from the params which take precedence.
    const parsedOptions = processDropdownOptions(memoOptions);

    // position the dropdown element near the target
    setDropdownPositionStyles(parsedOptions.dxPosition, {
      arrow: parsedOptions.dxArrow,
      offset: parsedOptions.dxOffset,
      origin: parsedOptions.dxOrigin,
      dropdownNode: popover,
      targetNode: target,
      alignmentNode: alignmentRef.current,
    });

    // show the popover
    showPopover();
  }, [popoverRef, targetRef, memoOptions, showPopover]);

  return useMemo(
    () => ({
      dropdownRef: popoverRef,
      setDropdownRef,
      alignmentRef,
      targetRef,
      setTargetRef,
      closeDropdown: hidePopover,
      openDropdown,
    }),
    [
      hidePopover,
      openDropdown,
      popoverRef,
      setDropdownRef,
      setTargetRef,
      targetRef,
    ]
  );
};
