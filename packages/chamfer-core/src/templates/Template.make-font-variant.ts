import type { TokensConfig } from "../Chamfer.js";
import { toKebabCase } from "../schemas/schema.font.js";
import { createCSSProperty } from "../utils/index.js";
import { defineTemplate } from "./types.js";

type FontVariantManifestEntry = {
  family: string;
  weight: string;
  size: number;
  lineHeight: number;
  letterSpacing: number;
};

/**
 * Shared by `tokens()` and `cssProperties()` so the size/weight/family
 * derivation only happens in one place — mirrors the pattern
 * `createColorManifest` uses in Template.make-color.ts.
 */
function createFontVariantManifest(config: TokensConfig): Record<string, FontVariantManifestEntry> {
  const { baseFontSize } = config.config.sizeAndSpace;
  const variants: Record<string, FontVariantManifestEntry> = {};

  for (const [variantName, variant] of Object.entries(config.config.font.variants)) {
    const weightName = variant.weight.split("-")[0];
    const familyKey = toKebabCase(variant.familyToken);
    variants[variantName] = {
      family: familyKey,
      weight: `${familyKey}-${weightName}`,
      size: variant.size / baseFontSize,
      lineHeight: variant.lineHeight,
      letterSpacing: variant.letterSpacing ?? 0
    };
  }

  return variants;
}

function makeFontVariantUtil<
  T extends { prefix: string; font: { variants: Record<string, unknown> } }
>(tokens: T) {
  return {
    makeFontVariant(variantName: keyof T["font"]["variants"] & string): string {
      // The CSS `font` shorthand is: [style || variant || weight] size[/line-height] family
      // — family must be last, and size (with optional /line-height) directly
      // precedes it. `letter-spacing` has no place in the shorthand at all,
      // so it stays a separate declaration alongside it. Both values are
      // declared once in :root by cssProperties() below; this just refers
      // to them, the same way every other template's util does.
      return [
        `font: var(--${tokens.prefix}-font-variant-${variantName})`,
        `letter-spacing: var(--${tokens.prefix}-font-variant-${variantName}-letter-spacing)`
      ].join(";\n  ");
    }
  };
}

export const fontVariantTemplate = defineTemplate({
  name: "makeFontVariant",
  namespace: "font-variant",
  description:
    "Generates typed font variant utilities that output a CSS `font` shorthand declaration plus letter-spacing.",
  tokens(config) {
    return { font: { variants: createFontVariantManifest(config) } };
  },
  cssProperties(config) {
    const prefix = config.config.runtime.prefix;
    const variants = createFontVariantManifest(config);

    return Object.entries(variants).flatMap(([variantName, v]) => [
      `${createCSSProperty(prefix, "font-variant", variantName)}: var(--${prefix}-font-weight-${v.weight}) ${v.size}rem/${v.lineHeight} var(--${prefix}-font-family-${v.family})`,
      `${createCSSProperty(prefix, "font-variant", variantName, "letter-spacing")}: ${v.letterSpacing}em`
    ]);
  },
  util: makeFontVariantUtil
});
