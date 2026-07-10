import { colorTemplate } from "./Template.make-color.js";
import { defineTemplate } from "./types.js";
import { computeWcagContrast, wcagLevel } from "./wcag-contrast.js";

function makeSemanticColorUtil<
  T extends { prefix: string; semantic: Record<string, { light: string; dark: string }> }
>(tokens: T) {
  type Role = keyof T["semantic"] & string;
  return {
    makeSemanticColor(role: Role, options?: { opacity?: number }): string {
      const opacity = options?.opacity ?? 1;
      const varRef = `var(--${tokens.prefix}-semantic-${role})`;
      if (opacity === 1) return varRef;
      return `color-mix(in oklch, ${varRef}, transparent ${parseFloat(((1 - opacity) * 100).toFixed(4))}%)`;
    }
  };
}

export const semanticTemplate = defineTemplate({
  name: "makeSemanticColor",
  namespace: "semantic",
  description:
    "Generates light-dark() CSS variables for semantic color roles. Each role maps a primitive color token to a light and dark scheme value.",
  tokens(config): { semantic: Record<string, { light: string; dark: string }> } {
    const semantic: Record<string, { light: string; dark: string }> = {};
    for (const [role, entry] of Object.entries(config.config.semantic)) {
      semantic[role] = { light: entry.light, dark: entry.dark };
    }
    return { semantic };
  },
  cssProperties(config) {
    const prefix = config.config.runtime.prefix;
    // Resolve the flat oklch manifest from the color template so we can compute WCAG contrast
    const colorManifest = colorTemplate.tokens(config).color as Record<string, string>;
    const properties: string[] = [];

    for (const [role, entry] of Object.entries(config.config.semantic)) {
      properties.push(
        `--${prefix}-semantic-${role}: light-dark(var(--${prefix}-color-${entry.light}), var(--${prefix}-color-${entry.dark}))`
      );

      const lightOklch = colorManifest[entry.light];
      const darkOklch = colorManifest[entry.dark];
      if (lightOklch && darkOklch) {
        const ratio = computeWcagContrast(lightOklch, darkOklch);
        if (ratio !== null) {
          const level = wcagLevel(ratio);
          if (level === "Fail" || level === "AA Large") {
            console.warn(
              `[chamfer] ⚠ semantic.${role}: light(${entry.light}) vs dark(${entry.dark}) contrast ${ratio}:1 — ${level}`
            );
          }
        }
      }
    }

    return properties;
  },
  util: makeSemanticColorUtil
});
