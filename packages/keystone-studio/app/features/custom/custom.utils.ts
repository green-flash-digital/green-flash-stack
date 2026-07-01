import type {
  KeystoneConfig,
  CustomVariantNumber,
  CustomVariantRem,
  CustomVariantString
} from "@keystone-css/core/schemas";
import { generateGUID } from "ts-jolt/isomorphic";
import type { Updater } from "use-immer";
import { useImmer } from "use-immer";

export type ConfigurationStateCustomValueRem = {
  name: string;
} & CustomVariantRem;
export type ConfigurationStateCustomValueNumber = {
  name: string;
} & CustomVariantNumber;
export type ConfigurationStateCustomValueString = {
  name: string;
} & CustomVariantString;
export type ConfigurationStateCustomValue =
  | ConfigurationStateCustomValueRem
  | ConfigurationStateCustomValueNumber
  | ConfigurationStateCustomValueString;

export type ConfigurationStateCustom = {
  [key: string]: ConfigurationStateCustomValue;
};

function getInitCustomStateFromConfig(config: KeystoneConfig): ConfigurationStateCustom {
  return Object.entries(config.custom).reduce<ConfigurationStateCustom>(
    (accum, [name, value]) =>
      Object.assign<ConfigurationStateCustom, ConfigurationStateCustom>(accum, {
        [generateGUID()]: {
          name,
          ...value
        }
      }),
    {}
  );
}

export type OnCustomAction = (
  options:
    | {
        action: "addToken";
      }
    | { action: "deleteToken"; id: string }
    | { action: "updateName"; id: string; name: string }
    | { action: "updateDescription"; id: string; description: string }
    | {
        action: "updateType";
        id: string;
        type: ConfigurationStateCustomValue["type"];
      }
    | {
        action: "updateValue";
        id: string;
        value: ConfigurationStateCustomValue["value"];
      }
) => void;

export function useConfigStateCustom(initConfig: KeystoneConfig) {
  return useImmer(getInitCustomStateFromConfig(initConfig));
}

export type ConfigurationContextCustomType = {
  custom: ConfigurationStateCustom;
  setCustom: Updater<ConfigurationStateCustom>;
};

export function getCustomConfigFromState(
  state: ConfigurationStateCustom
): KeystoneConfig["custom"] {
  return Object.values(state).reduce(
    (accum, { name, ...restDef }) =>
      Object.assign<KeystoneConfig["custom"], KeystoneConfig["custom"]>(accum, {
        [name]: restDef
      }),
    {}
  );
}
