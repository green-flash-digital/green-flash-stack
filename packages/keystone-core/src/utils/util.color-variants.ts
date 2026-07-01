import chroma from "chroma-js";

import type { KeystoneColor, KeystoneColorVariant } from "../schemas/schema.color.js";

export type HEXValue = string;
export type VariantMap = {
  base: string;
  [variantName: string]: HEXValue;
};
export type VariantManifest = {
  [colorName: string]: VariantMap;
};

function toOklchString(color: chroma.Color): string {
  const [L, C, H] = color.oklch();
  return `oklch(${L.toFixed(4)} ${C.toFixed(4)} ${(isNaN(H) ? 0 : H).toFixed(2)})`;
}

export function autoCreateVariantMap(variants: string[]): Omit<VariantMap, "base"> {
  return variants.reduce<Omit<VariantMap, "base">>((accum, variant, i) => {
    const variantName = i === 0 ? "50" : (i * 100).toString();
    return Object.assign(accum, { [variantName]: variant });
  }, {});
}

export function createVariantsFromBaseHex(
  baseHex: string,
  variantDef: KeystoneColorVariant | undefined
): VariantMap {
  const base = chroma(baseHex);
  const baseOklch = toOklchString(base);
  const scale = chroma.scale([base.brighten(2.5), base, base.darken(2)]).mode("oklch");

  if (variantDef === undefined || variantDef === null) return { base: baseOklch };

  if (typeof variantDef === "number") {
    if (variantDef === 0) return { base: baseOklch };
    const oklchColors = scale.colors(variantDef).map((h) => toOklchString(chroma(h)));
    return { base: baseOklch, ...autoCreateVariantMap(oklchColors) };
  }

  if (Array.isArray(variantDef)) {
    const oklchColors = scale.colors(variantDef.length).map((h) => toOklchString(chroma(h)));
    return { base: baseOklch, ...autoCreateVariantMap(oklchColors) };
  }

  // key-value: explicit hex values per step
  const result: VariantMap = { base: baseOklch };
  for (const [key, hex] of Object.entries(variantDef)) {
    result[key] = toOklchString(chroma(hex));
  }
  return result;
}

export function createColorVariants(colorConfig: KeystoneColor): VariantManifest {
  const { vibe, colors } = colorConfig;
  return Object.entries(colors).reduce<VariantManifest>((accum, [name, entry]) => {
    if ("hue" in entry) {
      if (!vibe) return accum;
      const baseHex = chroma(vibe.lightness, vibe.chroma, entry.hue, "oklch").hex();
      return Object.assign(accum, {
        [name]: createVariantsFromBaseHex(baseHex, entry.variants)
      });
    }
    return Object.assign(accum, {
      [name]: createVariantsFromBaseHex(entry.hex, entry.variants)
    });
  }, {});
}
