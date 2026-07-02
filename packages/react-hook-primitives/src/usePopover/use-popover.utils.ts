export function ensurePopover<T extends HTMLElement>(
  node: T | null
): node is T {
  if (node === null) {
    console.warn(
      "The `popoverRef` has not been correctly initialized. Ensure that you run the `setPopoverRef` as a RefCallback"
    );
  }
  return node !== null;
}

export function ensureTarget<T extends HTMLElement>(node: T | null): node is T {
  if (node === null) {
    console.warn(
      "The `targetRef` has not been correctly initialized. Ensure that you run the `setTargetRef` as a RefCallback"
    );
  }
  return node !== null;
}
