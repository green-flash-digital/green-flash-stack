import type {
  KeystoneConfig,
  KeystoneColorEntry,
  KeystoneColorEntryHue,
  KeystoneColorEntryHex,
  KeystoneColorVibe,
  VibeName
} from "@keystone-css/core/schemas";
import { vibePresets, ConfigSchema } from "@keystone-css/core/schemas";
import { createColorVariants } from "@keystone-css/core/utils";
import { generateGUID } from "ts-jolt/isomorphic";
import type { Updater } from "use-immer";
import { useImmer } from "use-immer";

export { vibePresets };
export type { VibeName };

export const initConfig: KeystoneConfig = ConfigSchema.parse({});

// ── State types ──────────────────────────────────────────────────────────────

export type ConfigurationStateColorHueEntry = {
  name: string;
  hue: number;
  variants: number | string[];
};

export type ConfigurationStateColorHexEntry = {
  name: string;
  hex: string;
  variants: number | string[] | Record<string, string>;
};

export type ConfigurationStateColor = {
  vibe: KeystoneColorVibe | undefined;
  hue: { [id: string]: ConfigurationStateColorHueEntry };
  hex: { [id: string]: ConfigurationStateColorHexEntry };
};

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

// Default lightness/chroma for each vibe (midpoint of its range)
export const vibeDefaults: Record<VibeName, { lightness: number; chroma: number }> = {
  earth: { lightness: 0.525, chroma: 0.075 },
  fluorescent: { lightness: 0.825, chroma: 0.23 },
  jewel: { lightness: 0.475, chroma: 0.18 },
  neutral: { lightness: 0.7, chroma: 0.01 },
  pastel: { lightness: 0.86, chroma: 0.07 }
};

// ── Config → state ───────────────────────────────────────────────────────────

export function getInitColorStateFromConfig(config: KeystoneConfig): ConfigurationStateColor {
  const hue: ConfigurationStateColor["hue"] = {};
  const hex: ConfigurationStateColor["hex"] = {};

  for (const [name, entry] of Object.entries(config.color.colors)) {
    if ("hue" in entry) {
      hue[generateGUID()] = { name, hue: entry.hue, variants: entry.variants };
    } else {
      hex[generateGUID()] = { name, hex: entry.hex, variants: entry.variants };
    }
  }

  return { vibe: config.color.vibe, hue, hex };
}

// ── State → config ───────────────────────────────────────────────────────────

export function getColorConfigFromState(
  colorState: ConfigurationStateColor
): KeystoneConfig["color"] {
  const colors: Record<string, KeystoneColorEntry> = {};

  for (const { name, hue, variants } of Object.values(colorState.hue)) {
    colors[name] = { hue, variants } satisfies KeystoneColorEntryHue;
  }
  for (const { name, hex, variants } of Object.values(colorState.hex)) {
    colors[name] = { hex, variants } satisfies KeystoneColorEntryHex;
  }

  return { vibe: colorState.vibe, colors };
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useConfigStateColor(initConfig: KeystoneConfig) {
  return useImmer(getInitColorStateFromConfig(initConfig));
}
export type ConfigurationContextColorType = {
  color: ConfigurationStateColor;
  setColor: Updater<ConfigurationStateColor>;
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

// kept for components that haven't been migrated yet
export const convertBrandColorIntoVariants = convertHueColorsIntoVariants;
export const convertNeutralColorIntoVariants = convertHexColorsIntoVariants;

export const colorThemeMap: Record<string, string> = {
  dark: "#1e1e1e",
  light: "#ffffff"
};
