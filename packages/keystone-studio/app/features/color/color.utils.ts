import type {
  KeystoneColorEntryHue,
  KeystoneColorEntryHex,
  VibeName
} from "@keystone-css/core/schemas";
import { vibePresets } from "@keystone-css/core/schemas";
import { createColorVariants } from "@keystone-css/core/utils";

import type { ConfigurationStateColor } from "../studio.state";

export { vibePresets };
export type { VibeName };

// ── Vibe presets formatted for InputRange (min/max per field) ────────────────

export const colorVibePresets: Record<
  VibeName,
  { lightness: { min: number; max: number }; chroma: { min: number; max: number } }
> = {
  earth: {
    lightness: { min: vibePresets.earth.minL, max: vibePresets.earth.maxL },
    chroma: { min: vibePresets.earth.minC, max: vibePresets.earth.maxC }
  },
  fluorescent: {
    lightness: { min: vibePresets.fluorescent.minL, max: vibePresets.fluorescent.maxL },
    chroma: { min: vibePresets.fluorescent.minC, max: vibePresets.fluorescent.maxC }
  },
  jewel: {
    lightness: { min: vibePresets.jewel.minL, max: vibePresets.jewel.maxL },
    chroma: { min: vibePresets.jewel.minC, max: vibePresets.jewel.maxC }
  },
  neutral: {
    lightness: { min: vibePresets.neutral.minL, max: vibePresets.neutral.maxL },
    chroma: { min: vibePresets.neutral.minC, max: vibePresets.neutral.maxC }
  },
  pastel: {
    lightness: { min: vibePresets.pastel.minL, max: vibePresets.pastel.maxL },
    chroma: { min: vibePresets.pastel.minC, max: vibePresets.pastel.maxC }
  }
};

export const vibeDefaults: Record<VibeName, { lightness: number; chroma: number }> = {
  earth: { lightness: 0.525, chroma: 0.075 },
  fluorescent: { lightness: 0.825, chroma: 0.23 },
  jewel: { lightness: 0.475, chroma: 0.18 },
  neutral: { lightness: 0.7, chroma: 0.01 },
  pastel: { lightness: 0.86, chroma: 0.07 }
};

// ── Preview helpers ──────────────────────────────────────────────────────────

export function convertHueColorsIntoVariants(color: ConfigurationStateColor) {
  if (!color.vibe) return {};
  const colors: Record<string, KeystoneColorEntryHue> = Object.values(color.hue).reduce(
    (acc, { name, hue, variants }) => Object.assign(acc, { [name]: { hue, variants } }),
    {}
  );
  return createColorVariants({ vibe: color.vibe, colors });
}

export function convertHexColorsIntoVariants(color: ConfigurationStateColor) {
  const colors: Record<string, KeystoneColorEntryHex> = Object.values(color.hex).reduce(
    (acc, { name, hex, variants }) => Object.assign(acc, { [name]: { hex, variants } }),
    {}
  );
  return createColorVariants({ colors });
}

export const convertBrandColorIntoVariants = convertHueColorsIntoVariants;
export const convertNeutralColorIntoVariants = convertHexColorsIntoVariants;

export const colorThemeMap: Record<string, string> = {
  dark: "#1e1e1e",
  light: "#ffffff"
};
