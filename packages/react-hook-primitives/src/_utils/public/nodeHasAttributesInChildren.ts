export function hasAttributesInChildren<T extends HTMLElement | Element>(
  node: T,
  attributes: { name: string; value: string }[]
): boolean {
  // Check if the current node has all specified attributes
  const hasAllAttributes = attributes.every(
    (attr) => node.getAttribute(attr.name) === attr.value
  );
  if (hasAllAttributes) {
    return true;
  }

  // Iterate through the child nodes
  for (const child of node.children) {
    // Recursively check each child
    if (hasAttributesInChildren(child as HTMLElement, attributes)) {
      return true;
    }
  }

  // If none of the children have the attributes
  return false;
}
