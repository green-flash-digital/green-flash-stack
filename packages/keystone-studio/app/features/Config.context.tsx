import type { FC, ReactNode } from "react";
import { useContext, useMemo, createContext, useCallback } from "react";

import type { KeystoneConfig } from "@keystone-css/core/schemas";
import { TokensSchema } from "@keystone-css/core/schemas";
import type { Updater } from "use-immer";
import { useImmer } from "use-immer";

import type { StudioState } from "./studio.state";
import { initStudioState, getTokensFromState } from "./studio.state";

export type ConfigurationContextType = {
  state: StudioState;
  update: Updater<StudioState>;
  getTokens: () => KeystoneConfig;
  originalConfig: KeystoneConfig;
};

const ConfigurationContext = createContext<ConfigurationContextType | null>(null);

export type ConfigurationProviderProps = {
  children: ReactNode;
  originalConfig: KeystoneConfig;
};

export const ConfigurationProvider: FC<ConfigurationProviderProps> = ({
  children,
  originalConfig
}) => {
  const [state, update] = useImmer<StudioState>(() => initStudioState(originalConfig));

  const getTokens = useCallback<ConfigurationContextType["getTokens"]>(() => {
    const raw = getTokensFromState(state);
    const parsed = TokensSchema.safeParse(raw);
    if (parsed.error) throw parsed.error;
    return parsed.data;
  }, [state]);

  const value = useMemo<ConfigurationContextType>(
    () => ({ state, update, getTokens, originalConfig }),
    [state, update, getTokens, originalConfig]
  );

  return <ConfigurationContext.Provider value={value}>{children}</ConfigurationContext.Provider>;
};

export const useConfigurationContext = (): ConfigurationContextType => {
  const context = useContext(ConfigurationContext);
  if (!context) {
    throw new Error(
      "'useConfigurationContext()' must be used within a <ConfigurationProvider /> component"
    );
  }
  return context;
};
