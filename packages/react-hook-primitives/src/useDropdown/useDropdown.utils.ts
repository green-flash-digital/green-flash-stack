import { css } from "@linaria/core";

import type {
  DropdownOptionArrow,
  DropdownOptionOrigin,
  DropdownOptionPosition,
  DropdownOptions,
} from "./useDropdown.types.js";

export function isDropdownOpen<T extends HTMLElement = HTMLElement>(
  node: T | undefined | null
) {
  return node?.classList.contains("open");
}

export const arrowClassName = css`
  overflow: visible;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    height: 0;
    width: 0;
    left: var(--arrow-left);
    top: var(--arrow-top);
    display: block;
    border-right-color: green;
  }
`;

const arrowUp = css`
  &::after {
    border-left: calc(var(--arrow-size) / 2) solid transparent;
    border-right: calc(var(--arrow-size) / 2) solid transparent;
    border-bottom: var(--arrow-size) solid var(--arrow-color);
  }
`;

const arrowDown = css`
  &::after {
    border-left: calc(var(--arrow-size) / 2) solid transparent;
    border-right: calc(var(--arrow-size) / 2) solid transparent;
    border-top: var(--arrow-size) solid var(--arrow-color);
  }
`;

const arrowLeft = css`
  &::after {
    border-top: calc(var(--arrow-size) / 2) solid transparent;
    border-bottom: calc(var(--arrow-size) / 2) solid transparent;
    border-right: var(--arrow-size) solid var(--arrow-color);
  }
`;

const arrowRight = css`
  &::after {
    border-top: calc(var(--arrow-size) / 2) solid transparent;
    border-bottom: calc(var(--arrow-size) / 2) solid transparent;
    border-left: var(--arrow-size) solid var(--arrow-color);
  }
`;

export const arrowClassNames: { [key in DropdownOptionPosition]: string } = {
  "bottom-center": arrowUp,
  "bottom-left": arrowUp,
  "bottom-right": arrowUp,
  "top-center": arrowDown,
  "top-left": arrowDown,
  "top-right": arrowDown,
  "left-top": arrowRight,
  "left-middle": arrowRight,
  "left-bottom": arrowRight,
  "right-top": arrowLeft,
  "right-middle": arrowLeft,
  "right-bottom": arrowLeft,
};

export const useDropdownPositions: DropdownOptionPosition[] = [
  "bottom-center",
  "bottom-left",
  "bottom-right",
  "top-center",
  "top-left",
  "top-right",
  "right-bottom",
  "right-middle",
  "right-top",
  "left-bottom",
  "left-middle",
  "left-top",
];

export const processDropdownOptions = (
  options?: Omit<DropdownOptions, "id">
): Required<Omit<DropdownOptions, "id">> => ({
  dxPosition: options?.dxPosition || "bottom-left",
  dxArrow: {
    size: options?.dxArrow?.size ?? 0,
    color: options?.dxArrow?.color ?? "transparent",
  },
  dxOffset: options?.dxOffset ?? 0,
  dxOrigin: options?.dxOrigin ?? "top-left",
});

export function setDropdownPositionStyles<
  TargetElement extends HTMLElement = HTMLElement,
  DropdownElement extends HTMLElement = HTMLElement
>(
  position: DropdownOptionPosition,
  {
    offset,
    arrow,
    dropdownNode,
    targetNode,
    alignmentNode,
  }: {
    arrow: DropdownOptionArrow;
    origin: DropdownOptionOrigin;
    offset: number;
    dropdownNode: DropdownElement;
    targetNode: TargetElement;
    alignmentNode: HTMLElement | null;
  }
) {
  const alignmentTarget = alignmentNode ?? targetNode;
  const targetBox = alignmentTarget.getBoundingClientRect();

  if (!targetBox) {
    return console.warn(
      "Cannot properly position menu near target. Target bounding box is `undefined`"
    );
  }

  let dropdownHeight = dropdownNode.offsetHeight;
  let dropdownWidth = dropdownNode.offsetWidth;

  // Ensure the popover dimensions are non-zero
  if (dropdownHeight === 0 || dropdownWidth === 0) {
    dropdownNode.style.setProperty("visibility", "hidden");
    dropdownNode.style.setProperty("display", "block");

    dropdownHeight = dropdownNode.offsetHeight;
    dropdownWidth = dropdownNode.offsetWidth;

    dropdownNode.style.removeProperty("visibility");
    dropdownNode.style.removeProperty("display");
  }

  const { popoverTop, popoverLeft, resolvedPosition } =
    calculateDropdownPosition(position, {
      targetBox,
      offset: offset || arrow.size,
      popover: {
        // using offsets here to ignore any scaling while also
        // factoring in padding, margin, border and possible scroll bars
        height: dropdownHeight,
        width: dropdownWidth,
      },
    });

  dropdownNode.style.setProperty("top", `${popoverTop}px`);
  dropdownNode.style.setProperty("left", `${popoverLeft}px`);

  if (!arrow) return;

  const { arrowLeft, arrowTop } = calculateArrowPosition(resolvedPosition, {
    targetBox,
    arrow: arrow.size,
    popoverLeft,
    popoverTop,
  });

  dropdownNode.classList.add(arrowClassName);
  dropdownNode.style.setProperty("--arrow-size", `${arrow.size}px`);
  dropdownNode.style.setProperty("--arrow-left", arrowLeft);
  dropdownNode.style.setProperty("--arrow-top", arrowTop);
  dropdownNode.style.setProperty("--arrow-color", arrow.color ?? "transparent");
  dropdownNode.classList.add(arrowClassNames[resolvedPosition]);
}

function calculateDropdownPosition(
  position: DropdownOptionPosition,
  {
    offset,
    targetBox,
    popover,
  }: {
    offset: number;
    targetBox: DOMRect;
    popover: { height: number; width: number };
  }
) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let top = 0;
  let left = 0;
  let resolvedPosition = position;

  switch (position) {
    case "top-left":
      top = targetBox.top - popover.height - offset;
      left = targetBox.left;
      resolvedPosition = position;
      break;
    case "top-center":
      top = targetBox.top - popover.height - offset;
      left = targetBox.left + targetBox.width / 2 - popover.width / 2;
      resolvedPosition = position;
      break;
    case "top-right":
      top = targetBox.top - popover.height - offset;
      left = targetBox.left + targetBox.width - popover.width;
      resolvedPosition = position;
      break;
    case "right-top":
      top = targetBox.top;
      left = targetBox.right + offset;
      resolvedPosition = position;
      break;
    case "right-middle":
      top = targetBox.top + targetBox.height / 2 - popover.height / 2;
      left = targetBox.right + offset;
      resolvedPosition = position;
      break;
    case "right-bottom":
      top = targetBox.bottom - popover.height;
      left = targetBox.right + offset;
      resolvedPosition = position;
      break;
    case "bottom-right":
      top = targetBox.bottom + offset;
      left = targetBox.left + targetBox.width - popover.width;
      resolvedPosition = position;
      break;
    case "bottom-center":
      top = targetBox.bottom + offset;
      left = targetBox.left + targetBox.width / 2 - popover.width / 2;
      resolvedPosition = position;
      break;
    case "bottom-left":
      top = targetBox.bottom + offset;
      left = targetBox.left;
      resolvedPosition = position;
      break;
    case "left-bottom":
      top = targetBox.bottom - popover.height;
      left = targetBox.left - popover.width - offset;
      resolvedPosition = position;
      break;
    case "left-middle":
      top = targetBox.top + targetBox.height / 2 - popover.height / 2;
      left = targetBox.left - popover.width - offset;
      resolvedPosition = position;
      break;
    case "left-top":
      top = targetBox.top;
      left = targetBox.left - popover.width - offset;
      resolvedPosition = position;
      break;
    default:
      break;
  }

  // Adjust positions if out of viewport
  if (top + popover.height > viewportHeight) {
    top = viewportHeight - popover.height;
  }
  if (left + popover.width > viewportWidth) {
    left = viewportWidth - popover.width;
  }
  if (top < 0) {
    top = 0;
  }
  if (left < 0) {
    left = 0;
  }

  return { popoverTop: top, popoverLeft: left, resolvedPosition };
}

function calculateArrowPosition(
  resolvedPosition: DropdownOptionPosition,
  {
    targetBox,
    arrow,
    popoverLeft,
    popoverTop,
  }: {
    targetBox: DOMRect;
    arrow: number;
    popoverTop: number;
    popoverLeft: number;
  }
) {
  const relativeTargetOffsetLeftToDropdown = targetBox.left - popoverLeft; // the relative left part of the target is to the popover
  const relativeTargetOffsetTopToDropdown = targetBox.top - popoverTop; // the relative top part of the target is to the popover
  const halfOfTargetWidth = targetBox.width / 2;
  const halfOfTargetHeight = targetBox.height / 2;
  const halfOfArrow = arrow / 2;
  const offsetLeftCenterTarget = halfOfTargetWidth - halfOfArrow; // the left value of the horizontal center of the target
  const offsetTopCenterTarget = halfOfTargetHeight - halfOfArrow; // the top value of the vertical center of the target

  // calculate left
  let arrowLeft = "";
  let arrowTop = "";
  const adjustmentFactor = 0.15;
  if (resolvedPosition.startsWith("bottom")) {
    const top = arrow * -1;
    const left = relativeTargetOffsetLeftToDropdown + offsetLeftCenterTarget;
    arrowTop = `${top - top * adjustmentFactor}px`;
    arrowLeft = `${left}px`;
  }

  if (resolvedPosition.startsWith("top")) {
    const left = relativeTargetOffsetLeftToDropdown + offsetLeftCenterTarget;
    arrowTop = `calc(100% - ${arrow * adjustmentFactor}px)`;
    arrowLeft = `${left}px`;
  }

  if (resolvedPosition.startsWith("right")) {
    const top = relativeTargetOffsetTopToDropdown + offsetTopCenterTarget;
    const left = arrow * -1;
    arrowTop = `${top}px`;
    arrowLeft = `${left - left * adjustmentFactor}px`;
  }

  if (resolvedPosition.startsWith("left")) {
    const top = relativeTargetOffsetTopToDropdown + offsetTopCenterTarget;
    arrowTop = `${top}px`;
    arrowLeft = `calc(100% - ${arrow * adjustmentFactor}px)`;
  }

  return { arrowTop, arrowLeft };
}
