import { exhaustiveMatchGuard, generateGUID } from "@green-flash/ts-utils/isomorphic";
import type {
  KeystoneConfig,
  KeystoneColorEntry,
  KeystoneColorEntryHue,
  KeystoneColorEntryHex,
  KeystoneColorVibe,
  FontVariant,
  ManualFontStyles,
  FontFamiliesManual,
  SpaceAuto,
  SpaceManual,
  KeystoneConfigSizeAndSpace,
  CustomVariantNumber,
  CustomVariantRem,
  CustomVariantString
} from "@keystone-css/core/schemas";
import { fontFamilyFallback, manualFontStyles } from "@keystone-css/core/schemas";
import type { SpaceVariantsRecord } from "@keystone-css/core/utils";
import { calculateSpaceVariantsAuto, calculateSpaceVariantsManual } from "@keystone-css/core/utils";
import { match } from "ts-pattern";

// ── Color state types ─────────────────────────────────────────────────────────

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

// ── Font state types ──────────────────────────────────────────────────────────

export type ConfigurationStateFontVariantValue = {
  variantName: string;
  familyToken: string;
  weight: string;
  size: number;
  lineHeight: number;
  letterSpacing: number;
};
export type ConfigurationStateFontVariant = Record<string, ConfigurationStateFontVariantValue>;

export type ConfigurationStateFontFamilyValuesMeta = {
  meta: {
    isOpen: boolean;
  };
};

export type ConfigurationStateFontManualFamilyValues = ConfigurationStateFontFamilyValuesMeta & {
  tokenName: string;
  familyName: string;
  fallback?: string;
  styles: {
    [key: string]: { display: string };
  };
};
export type ConfigurationStateFontManualFamily = Record<
  string,
  ConfigurationStateFontManualFamilyValues
>;

export type ConfigurationStateFont = {
  source: "manual";
  variants: ConfigurationStateFontVariant;
  families: ConfigurationStateFontManualFamily;
};

// ── Size & Space state types ──────────────────────────────────────────────────

export type ConfigurationStateSizeAndSpace_SpaceVariants = {
  [id: string]: {
    name: string;
    value: number;
    order: number;
  };
};
export type ConfigurationStateSizeAndSpace_SpaceAuto = Omit<SpaceAuto, "variants"> & {
  variants: ConfigurationStateSizeAndSpace_SpaceVariants;
};
export type ConfigurationStateSizeAndSpace_SpaceManual = Omit<SpaceManual, "variants"> & {
  variants: ConfigurationStateSizeAndSpace_SpaceVariants;
};
export type ConfigurationStateSizeAndSpace_SizeVariants = Record<
  string,
  { name: string; value: number }
>;
export type ConfigurationStateSizeAndSpace = Pick<
  KeystoneConfigSizeAndSpace,
  "baseFontSize" | "baselineGrid"
> & {
  size: {
    variants: ConfigurationStateSizeAndSpace_SizeVariants;
  };
  space: {
    mode: Required<KeystoneConfigSizeAndSpace>["space"]["mode"];
    manual: ConfigurationStateSizeAndSpace_SpaceManual;
    auto: ConfigurationStateSizeAndSpace_SpaceAuto;
  };
};

// ── Response state types ──────────────────────────────────────────────────────

export type ConfigurationStateResponseBreakpointValue = {
  name: string;
  value: number;
};
type ConfigurationStateResponseBreakpoints = {
  [key: string]: ConfigurationStateResponseBreakpointValue;
};
export type ConfigurationStateResponse = {
  breakpoints: ConfigurationStateResponseBreakpoints;
};

// ── Custom state types ────────────────────────────────────────────────────────

export type ConfigurationStateCustomValueRem = { name: string } & CustomVariantRem;
export type ConfigurationStateCustomValueNumber = { name: string } & CustomVariantNumber;
export type ConfigurationStateCustomValueString = { name: string } & CustomVariantString;
export type ConfigurationStateCustomValue =
  | ConfigurationStateCustomValueRem
  | ConfigurationStateCustomValueNumber
  | ConfigurationStateCustomValueString;

export type ConfigurationStateCustom = {
  [key: string]: ConfigurationStateCustomValue;
};

// ── Settings state type ───────────────────────────────────────────────────────

export type ConfigurationStateSettings = KeystoneConfig["runtime"];

// ── Unified state ─────────────────────────────────────────────────────────────

export type StudioState = {
  color: ConfigurationStateColor;
  font: ConfigurationStateFont;
  sizing: ConfigurationStateSizeAndSpace;
  response: ConfigurationStateResponse;
  custom: ConfigurationStateCustom;
  settings: ConfigurationStateSettings;
};

// ── Config → state ────────────────────────────────────────────────────────────

function getInitColorStateFromConfig(config: KeystoneConfig): ConfigurationStateColor {
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

function getInitStateFontFromConfig(config: KeystoneConfig): ConfigurationStateFont {
  const variants = Object.entries(config.font.variants).reduce<ConfigurationStateFontVariant>(
    (accum, [variantName, variant]) =>
      Object.assign(accum, { [generateGUID()]: { variantName, ...variant } }),
    {}
  );
  return {
    source: "manual",
    variants,
    families: Object.entries(config.font.families).reduce<ConfigurationStateFontManualFamily>(
      (accum, [tokenName, familyDef]) =>
        Object.assign(accum, {
          [generateGUID()]: {
            tokenName,
            familyName: familyDef.family,
            fallback: familyDef.fallback,
            styles:
              familyDef.styles.length > 0
                ? familyDef.styles.reduce(
                    (acc, style) =>
                      Object.assign(acc, { [style]: { display: manualFontStyles[style] } }),
                    {}
                  )
                : { "regular-400": { display: manualFontStyles["regular-400"] } },
            meta: { isOpen: false }
          }
        }),
      {}
    )
  };
}

function convertSpaceVariantConfigIntoState(
  variants: SpaceVariantsRecord
): ConfigurationStateSizeAndSpace_SpaceVariants {
  const entries = Object.entries(variants).map(([name, value], i) => [
    generateGUID(),
    { name, value, order: i }
  ]);
  return Object.fromEntries(
    entries.sort((a, b) => (a[1] as { order: number }).order - (b[1] as { order: number }).order)
  );
}

function getInitStateSizeAndSpaceFromConfig(
  config: KeystoneConfig
): ConfigurationStateSizeAndSpace {
  const createSizeVariants = (
    variants: KeystoneConfig["sizeAndSpace"]["size"]["variants"]
  ): ConfigurationStateSizeAndSpace_SizeVariants =>
    Object.fromEntries(
      Object.entries(variants).map(([k, v]) => [generateGUID(), { name: k, value: v }])
    );

  switch (config.sizeAndSpace.space.mode) {
    case "auto": {
      const spaceVariants = convertSpaceVariantConfigIntoState(
        calculateSpaceVariantsAuto(
          config.sizeAndSpace.space.variants,
          config.sizeAndSpace.baselineGrid
        )
      );
      return {
        baseFontSize: config.sizeAndSpace.baseFontSize,
        baselineGrid: config.sizeAndSpace.baselineGrid,
        size: { variants: createSizeVariants(config.sizeAndSpace.size.variants) },
        space: {
          mode: "auto",
          auto: { mode: "auto", variants: spaceVariants },
          manual: {
            mode: "manual",
            variants: convertSpaceVariantConfigIntoState(calculateSpaceVariantsManual([4, 8, 12]))
          }
        }
      };
    }
    case "manual": {
      return {
        baseFontSize: config.sizeAndSpace.baseFontSize,
        baselineGrid: config.sizeAndSpace.baselineGrid,
        size: { variants: createSizeVariants(config.sizeAndSpace.size.variants) },
        space: {
          mode: "manual",
          auto: {
            mode: "auto",
            variants: convertSpaceVariantConfigIntoState(
              calculateSpaceVariantsAuto(10, config.sizeAndSpace.baselineGrid)
            )
          },
          manual: {
            mode: "manual",
            variants: convertSpaceVariantConfigIntoState(
              calculateSpaceVariantsManual(config.sizeAndSpace.space.variants)
            )
          }
        }
      };
    }
    default:
      return exhaustiveMatchGuard(config.sizeAndSpace.space);
  }
}

function getInitResponseStateFromConfig(config: KeystoneConfig): ConfigurationStateResponse {
  return {
    breakpoints: Object.entries(
      config.response.breakpoints
    ).reduce<ConfigurationStateResponseBreakpoints>(
      (accum, [name, value]) => Object.assign(accum, { [generateGUID()]: { name, value } }),
      {}
    )
  };
}

function getInitCustomStateFromConfig(config: KeystoneConfig): ConfigurationStateCustom {
  return Object.entries(config.custom).reduce<ConfigurationStateCustom>(
    (accum, [name, value]) => Object.assign(accum, { [generateGUID()]: { name, ...value } }),
    {}
  );
}

export function initStudioState(config: KeystoneConfig): StudioState {
  return {
    color: getInitColorStateFromConfig(config),
    font: getInitStateFontFromConfig(config),
    sizing: getInitStateSizeAndSpaceFromConfig(config),
    response: getInitResponseStateFromConfig(config),
    custom: getInitCustomStateFromConfig(config),
    settings: config.runtime
  };
}

// ── State → config ────────────────────────────────────────────────────────────

function getColorConfigFromState(state: ConfigurationStateColor): KeystoneConfig["color"] {
  const colors: Record<string, KeystoneColorEntry> = {};
  for (const { name, hue, variants } of Object.values(state.hue)) {
    colors[name] = { hue, variants } satisfies KeystoneColorEntryHue;
  }
  for (const { name, hex, variants } of Object.values(state.hex)) {
    colors[name] = { hex, variants } satisfies KeystoneColorEntryHex;
  }
  return { vibe: state.vibe, colors };
}

export function getFontConfigFromState(state: ConfigurationStateFont): KeystoneConfig["font"] {
  const families = Object.values(state.families).reduce(
    (accum, family) =>
      Object.assign<FontFamiliesManual, FontFamiliesManual>(accum, {
        [family.tokenName]: {
          family: family.familyName,
          fallback: family.fallback ?? fontFamilyFallback,
          styles: Object.keys(family.styles) as ManualFontStyles
        }
      }),
    {}
  );
  return {
    source: state.source,
    families,
    variants: Object.values(state.variants).reduce((accum, variant) => {
      accum[variant.variantName] = {
        familyToken: variant.familyToken,
        lineHeight: variant.lineHeight,
        size: variant.size,
        weight: variant.weight,
        letterSpacing: variant.letterSpacing
      };
      return accum;
    }, {} as FontVariant)
  };
}

function getSizeAndSpaceConfigFromState(
  state: ConfigurationStateSizeAndSpace
): KeystoneConfig["sizeAndSpace"] {
  const space = match<
    ConfigurationStateSizeAndSpace["space"],
    KeystoneConfig["sizeAndSpace"]["space"]
  >(state.space)
    .with({ mode: "auto" }, (s) => ({
      mode: "auto" as const,
      variants: Object.values(s.auto.variants).length
    }))
    .with({ mode: "manual" }, (s) => ({
      mode: "manual" as const,
      variants: Object.values(s.manual.variants)
        .sort((a, b) => a.order - b.order)
        .map(({ value }) => value)
    }))
    .exhaustive();

  return {
    baseFontSize: state.baseFontSize,
    baselineGrid: state.baselineGrid,
    size: {
      variants: Object.values(state.size.variants).reduce<
        KeystoneConfig["sizeAndSpace"]["size"]["variants"]
      >((accum, { name, value }) => Object.assign(accum, { [name]: value }), {})
    },
    space
  };
}

function getResponseConfigFromState(state: ConfigurationStateResponse): KeystoneConfig["response"] {
  return {
    breakpoints: Object.values(state.breakpoints).reduce<KeystoneConfig["response"]["breakpoints"]>(
      (accum, { name, value }) => Object.assign(accum, { [name]: value }),
      {}
    )
  };
}

function getCustomConfigFromState(state: ConfigurationStateCustom): KeystoneConfig["custom"] {
  return Object.values(state).reduce<KeystoneConfig["custom"]>(
    (accum, { name, ...restDef }) => Object.assign(accum, { [name]: restDef }),
    {}
  );
}

export function getTokensFromState(state: StudioState): KeystoneConfig {
  return {
    color: getColorConfigFromState(state.color),
    sizeAndSpace: getSizeAndSpaceConfigFromState(state.sizing),
    font: getFontConfigFromState(state.font),
    response: getResponseConfigFromState(state.response),
    custom: getCustomConfigFromState(state.custom),
    runtime: state.settings
  };
}
