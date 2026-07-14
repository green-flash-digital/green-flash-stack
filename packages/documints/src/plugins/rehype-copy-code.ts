import type { Element, Root } from "hast";
import { toString } from "hast-util-to-string";
import { visit } from "unist-util-visit";

/**
 * Wraps every Shiki-rendered `<pre>` in a container with a "Copy" button
 * carrying the block's raw code as a `data-copy-code` attribute. Works on
 * prerendered, static HTML with no per-block React hydration needed - see
 * copyCodeButton.ts for the one event-delegated client-side listener that
 * makes every button on the page work.
 */
export function rehypeCopyCode() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "pre" || index === undefined || !parent) return;

      const code = toString(node);
      const button: Element = {
        type: "element",
        tagName: "button",
        properties: {
          type: "button",
          className: ["copy-code-button"],
          "data-copy-code": code,
          "aria-label": "Copy code"
        },
        children: [{ type: "text", value: "Copy" }]
      };
      const wrapper: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["code-block"] },
        children: [node, button]
      };

      parent.children[index] = wrapper;
    });
  };
}
