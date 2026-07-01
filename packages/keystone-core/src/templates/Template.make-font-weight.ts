import type { TokensConfig } from "../Keystone.js";
import { toKebabCase } from "../schemas/schema.font.js";
import { createCSSProperty } from "../utils/index.js";
import { defineTemplate } from "./types.js";

type FamilyWeightPair = { raw: string; tokenKey: string; weightPart: string };

function getFamilyWeightPairs(config: TokensConfig): FamilyWeightPair[] {
  return Object.entries(config.config.font.families).reduce<FamilyWeightPair[]>(
    (accum, [familyName, familyDef]) => {
      for (const style of familyDef.styles) {
        const weightPart = style.split("-")[0];
        accum.push({
          raw: familyName,
          tokenKey: `${toKebabCase(familyName)}-${weightPart}`,
          weightPart
        });
      }
      return accum;
    },
    []
  );
}

function makeFontWeightUtil<
  T extends { prefix: string; font: { weights: Record<string, number> } }
>(tokens: T) {
  return {
    makeFontWeight(weightName: keyof T["font"]["weights"] & string): string {
      return `var(--${tokens.prefix}-font-weight-${weightName})`;
    }
  };
}

export const fontWeightTemplate = defineTemplate({
  name: "makeFontWeight",
  namespace: "font-weight",
  description: "Generates font-weight tokens derived from font family style definitions.",
  tokens(config) {
    const weights: Record<string, number> = {};
    for (const [familyName, familyDef] of Object.entries(config.config.font.families)) {
      for (const style of familyDef.styles) {
        const parts = style.split("-");
        weights[`${toKebabCase(familyName)}-${parts[0]}`] = parseInt(parts[1], 10);
      }
    }
    return { font: { weights } };
  },
  cssProperties(config) {
    const prefix = config.config.runtime.prefix;
    return getFamilyWeightPairs(config).reduce<string[]>((accum, { raw, tokenKey, weightPart }) => {
      const style = config.config.font.families[raw].styles.find((s) => s.startsWith(weightPart));
      if (!style) {
        throw new Error(`Cannot find a ${raw} style that begins with ${weightPart}.`);
      }
      const property = createCSSProperty(prefix, "font-weight", tokenKey);
      return accum.concat(`${property}: ${style.split("-")[1]}`);
    }, []);
  },
  util: makeFontWeightUtil
});
