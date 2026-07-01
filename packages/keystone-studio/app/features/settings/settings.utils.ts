import type { KeystoneConfig } from "@keystone-css/core/schemas";
import type { Updater } from "use-immer";
import { useImmer } from "use-immer";

export type ConfigurationStateSettings = KeystoneConfig["runtime"];

function getInitSettingsStateFromConfig(config: KeystoneConfig): ConfigurationStateSettings {
  return config.runtime;
}

export function useConfigStateSettings(initConfig: KeystoneConfig) {
  return useImmer(getInitSettingsStateFromConfig(initConfig));
}
export type ConfigurationContextSettingsType = {
  settings: ConfigurationStateSettings;
  setSettings: Updater<ConfigurationStateSettings>;
};

export function getSettingsConfigFromState(
  state: ConfigurationStateSettings
): KeystoneConfig["runtime"] {
  return state;
}
