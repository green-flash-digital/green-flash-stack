import {
  type FontVariant,
  type ManualFontStyles,
  type FontFamiliesManual,
  type KeystoneConfig,
  fontFamilyFallback,
  manualFontStyles
} from "@keystone-css/core/schemas";
import { generateGUID } from "ts-jolt/isomorphic";
import type { Updater } from "use-immer";
import { useImmer } from "use-immer";

export type ConfigurationStateFontFamilyWeights = Record<string, { name: string; value: number }>;

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

export function getInitStateFontFromConfig(config: KeystoneConfig): ConfigurationStateFont {
  const variants = Object.entries(config.font.variants).reduce<ConfigurationStateFontVariant>(
    (accum, [variantName, variant]) =>
      Object.assign<ConfigurationStateFontVariant, ConfigurationStateFontVariant>(accum, {
        [generateGUID()]: {
          variantName,
          ...variant
        }
      }),
    {}
  );

  return {
    source: "manual",
    variants,
    families: Object.entries(config.font.families).reduce<ConfigurationStateFontManualFamily>(
      (accum, [tokenName, familyDef]) =>
        Object.assign<ConfigurationStateFontManualFamily, ConfigurationStateFontManualFamily>(
          accum,
          {
            [generateGUID()]: {
              tokenName,
              familyName: familyDef.family,
              fallback: familyDef.fallback,
              styles:
                familyDef.styles.length > 0
                  ? familyDef.styles.reduce(
                      (accum, style) =>
                        Object.assign(accum, {
                          [style]: {
                            display: manualFontStyles[style]
                          }
                        }),
                      {}
                    )
                  : {
                      "regular-400": {
                        display: manualFontStyles["regular-400"]
                      }
                    },
              meta: {
                isOpen: false
              }
            }
          }
        ),
      {}
    )
  };
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
    variants: Object.values(state.variants).reduce(
      (accum, variant) =>
        Object.assign<typeof state.variants, FontVariant>(accum, {
          [variant.variantName]: {
            familyToken: variant.familyToken,
            lineHeight: variant.lineHeight,
            size: variant.size,
            weight: variant.weight,
            letterSpacing: variant.letterSpacing
          }
        }),
      {}
    )
  };
}

export function useConfigStateFont(initConfig: KeystoneConfig) {
  return useImmer(getInitStateFontFromConfig(initConfig));
}
export type ConfigurationContextFontType = {
  font: ConfigurationStateFont;
  setFont: Updater<ConfigurationStateFont>;
};

export type OnFontFamilyAction = (
  options:
    | { action: "addFontFamily" }
    | { action: "deleteFontFamily"; id: string }
    | { action: "toggle"; id: string }
    | { action: "addStyle"; id: string; style: string }
    | { action: "deleteStyle"; id: string; style: string }
    | {
        action: "changeTokenName";
        id: string;
        token: string;
      }
    | {
        action: "changeFamilyName";
        id: string;
        fontFamilyName: string;
      }
    | {
        action: "changeFallback";
        id: string;
        fallback: string | undefined;
      }
) => void;

export type OnFontVariantAction = (
  options:
    | { action: "addVariant" }
    | { action: "deleteVariant"; id: string }
    | { action: "changeVariantName"; id: string; name: string }
    | { action: "changeVariantFamilyToken"; id: string; familyToken: string }
    | { action: "changeVariantSize"; id: string; size: number }
    | {
        action: "changeVariantWeightAndStyle";
        id: string;
        weightAndStyle: string;
      }
) => void;
