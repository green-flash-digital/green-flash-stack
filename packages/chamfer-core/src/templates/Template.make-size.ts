import { createCSSProperty } from "../utils/index.js";
import { defineTemplate } from "./types.js";

function makeSizeUtil<T extends { prefix: string; size: Record<string, number> }>(tokens: T) {
  return {
    makeSize(variant: keyof T["size"] & string, options?: { unit?: "px" | "rem" }): string {
      const unit = options?.unit ?? "rem";
      return `var(--${tokens.prefix}-size-${variant}-${unit})`;
    }
  };
}

export const sizeTemplate = defineTemplate({
  name: "makeSize",
  namespace: "size",
  description:
    "Generates size tokens for named element heights (buttons, inputs, rows), with px and rem CSS variable variants.",
  tokens(config) {
    return { size: config.config.sizeAndSpace.size.variants };
  },
  cssProperties(config) {
    const { baseFontSize } = config.config.sizeAndSpace;
    const prefix = config.config.runtime.prefix;
    return Object.entries(config.config.sizeAndSpace.size.variants).flatMap(([name, px]) => [
      `${createCSSProperty(prefix, "size", name, "px")}: ${px}px`,
      `${createCSSProperty(prefix, "size", name, "rem")}: ${px / baseFontSize}rem`
    ]);
  },
  util: makeSizeUtil
});
