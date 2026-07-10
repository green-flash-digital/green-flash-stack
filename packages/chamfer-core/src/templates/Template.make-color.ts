import type { TokensConfig } from "../Chamfer.js";
import { createCSSProperty, createColorVariants } from "../utils/index.js";
import { defineTemplate } from "./types.js";

function createColorManifest(config: TokensConfig): Record<string, string> {
  const variantManifest = createColorVariants(config.config.color);
  const flatManifest: Record<string, string> = {};
  for (const colorKey in variantManifest) {
    const variants = variantManifest[colorKey];
    for (const variant in variants) {
      if (variant === "base") {
        flatManifest[colorKey] = variants[variant];
      } else {
        flatManifest[`${colorKey}-${variant}`] = variants[variant];
      }
    }
  }
  return flatManifest;
}

export function makeColorUtil<T extends { prefix: string; color: Record<string, string> }>(
  tokens: T
) {
  return {
    makeColor(tokenName: keyof T["color"] & string, options?: { opacity?: number }): string {
      const opacity = options?.opacity ?? 1;
      if (opacity === 1) return `var(--${tokens.prefix}-color-${tokenName})`;
      return `color-mix(in oklch, var(--${tokens.prefix}-color-${tokenName}), transparent ${parseFloat(((1 - opacity) * 100).toFixed(4))}%)`;
    }
  };
}

export const colorTemplate = defineTemplate({
  name: "makeColor",
  namespace: "color",
  description: "Generates oklch color tokens from a unified vibe + colors config.",
  tokens(config) {
    return { color: createColorManifest(config) };
  },
  cssProperties(config) {
    const prefix = config.config.runtime.prefix;
    return Object.entries(createColorManifest(config)).map(
      ([variantId, oklch]) => `${createCSSProperty(prefix, "color", variantId)}: ${oklch}`
    );
  },
  util: makeColorUtil
});
