import { exhaustiveMatchGuard } from "ts-jolt/isomorphic";

import { createCSSProperty } from "../utils/index.js";
import { defineTemplate } from "./types.js";

function makeCustomUtil<T extends { prefix: string; custom: Record<string, string> }>(tokens: T) {
  return {
    makeCustom(tokenName: keyof T["custom"] & string): string {
      return `var(--${tokens.prefix}-custom-${tokenName})`;
    }
  };
}

export const customTemplate = defineTemplate({
  name: "makeCustom",
  namespace: "custom",
  description:
    "Generates tokens for arbitrary custom values that don't fit other token categories.",
  tokens(config) {
    const { baseFontSize } = config.config.sizeAndSpace;
    const custom: Record<string, string> = {};
    for (const [tokenName, tokenValue] of Object.entries(config.config.custom)) {
      switch (tokenValue.type) {
        case "number":
        case "string":
          custom[tokenName] = String(tokenValue.value);
          break;
        case "rem":
          custom[tokenName] = `${tokenValue.value / baseFontSize}rem`;
          break;
        default:
          exhaustiveMatchGuard(tokenValue);
      }
    }
    return { custom };
  },
  cssProperties(config) {
    const prefix = config.config.runtime.prefix;
    const { baseFontSize } = config.config.sizeAndSpace;
    return Object.entries(config.config.custom).map(([customToken, customTokenValue]) => {
      const property = createCSSProperty(prefix, "custom", customToken);
      switch (customTokenValue.type) {
        case "number":
        case "string":
          return `${property}: ${customTokenValue.value}`;
        case "rem": {
          return `${property}: ${customTokenValue.value / baseFontSize}rem`;
        }
        default:
          return exhaustiveMatchGuard(customTokenValue);
      }
    });
  },
  util: makeCustomUtil
});
