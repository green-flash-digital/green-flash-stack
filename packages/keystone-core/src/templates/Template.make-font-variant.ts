import { toKebabCase } from "../schemas/schema.font.js";
import { defineTemplate } from "./types.js";

function makeFontVariantUtil<
  T extends {
    prefix: string;
    font: {
      variants: Record<
        string,
        {
          family: string;
          weight: string;
          size: number;
          lineHeight: number;
          letterSpacing: number;
        }
      >;
    };
  }
>(tokens: T) {
  return {
    makeFontVariant(variantName: keyof T["font"]["variants"] & string): string {
      const v = tokens.font.variants[variantName];
      return [
        `font-family: var(--${tokens.prefix}-font-family-${v.family})`,
        `font-weight: var(--${tokens.prefix}-font-weight-${v.weight})`,
        `font-size: ${v.size}rem`,
        `line-height: ${v.lineHeight}`,
        `letter-spacing: ${v.letterSpacing}em`
      ].join(";\n  ");
    }
  };
}

export const fontVariantTemplate = defineTemplate({
  name: "makeFontVariant",
  namespace: "font-variant",
  description: "Generates typed font variant utilities that output multi-property CSS blocks.",
  tokens(config) {
    const { baseFontSize } = config.config.sizeAndSpace;
    const variants: Record<
      string,
      {
        family: string;
        weight: string;
        size: number;
        lineHeight: number;
        letterSpacing: number;
      }
    > = {};

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

    return { font: { variants } };
  },
  cssProperties(_config) {
    return [];
  },
  util: makeFontVariantUtil
});
