import type { TokensConfig } from "../Keystone.js";
import { createCSSProperty } from "../utils/index.js";
import { defineTemplate } from "./types.js";

function getSpaceSteps(config: TokensConfig): readonly number[] {
  const { baselineGrid, space } = config.config.sizeAndSpace;
  if (space.mode === "manual") return space.variants;
  return Array.from({ length: space.variants }, (_, i) => baselineGrid * (i + 1));
}

function makeSpaceUtil<T extends { prefix: string; space: readonly number[] }>(tokens: T) {
  return {
    makeSpace(px: T["space"][number], options?: { unit?: "px" | "rem" }): string {
      const unit = options?.unit ?? "rem";
      return `var(--${tokens.prefix}-space-${px}-${unit})`;
    }
  };
}

export const spaceTemplate = defineTemplate({
  name: "makeSpace",
  namespace: "space",
  description:
    "Generates space tokens from baseline-grid steps, typed as a literal union of valid pixel values.",
  tokens(config) {
    return { space: getSpaceSteps(config) };
  },
  cssProperties(config) {
    const { baseFontSize } = config.config.sizeAndSpace;
    const prefix = config.config.runtime.prefix;
    return getSpaceSteps(config).flatMap((px) => [
      `${createCSSProperty(prefix, "space", String(px), "px")}: ${px}px`,
      `${createCSSProperty(prefix, "space", String(px), "rem")}: ${px / baseFontSize}rem`
    ]);
  },
  util: makeSpaceUtil
});
