import { toKebabCase } from "../schemas/schema.font.js";
import { createCSSProperty } from "../utils/index.js";
import { defineTemplate } from "./types.js";

function makeFontFamilyUtil<
  T extends { prefix: string; font: { families: Record<string, string> } }
>(tokens: T) {
  return {
    makeFontFamily(familyName: keyof T["font"]["families"] & string): string {
      return `var(--${tokens.prefix}-font-family-${familyName})`;
    }
  };
}

export const fontFamilyTemplate = defineTemplate({
  name: "makeFontFamily",
  namespace: "font-family",
  description: "Generates font-family tokens from manual font configurations.",
  tokens(config) {
    const families: Record<string, string> = {};
    for (const [name, def] of Object.entries(config.config.font.families)) {
      families[toKebabCase(name)] = `"${def.family}", ${def.fallback}`;
    }
    return { font: { families } };
  },
  cssProperties(config) {
    const prefix = config.config.runtime.prefix;
    return Object.entries(config.config.font.families).map(([fontFamilyName, fontFamilyValue]) => {
      const property = createCSSProperty(prefix, "font-family", toKebabCase(fontFamilyName));
      return `${property}: "${fontFamilyValue.family}", ${fontFamilyValue.fallback}`;
    });
  },
  util: makeFontFamilyUtil
});
