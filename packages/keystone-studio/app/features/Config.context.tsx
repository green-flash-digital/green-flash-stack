import type { FC, ReactNode } from "react";
import { useContext, useMemo, createContext, useCallback } from "react";

import type { KeystoneConfig } from "@keystone-css/core/schemas";
import { ConfigSchema } from "@keystone-css/core/schemas";

import type { ConfigurationContextColorType } from "./color/color.utils.js";
import { useConfigStateColor, getColorConfigFromState } from "./color/color.utils.js";
import type { ConfigurationContextCustomType } from "./custom/custom.utils.js";
import { getCustomConfigFromState, useConfigStateCustom } from "./custom/custom.utils.js";
import {
  type ConfigurationContextFontType,
  getFontConfigFromState,
  useConfigStateFont
} from "./font/font.utils.js";
import type { ConfigurationContextResponseType } from "./response/response.utils.js";
import { getResponseConfigFromState, useConfigStateResponse } from "./response/response.utils.js";
import type { ConfigurationContextSettingsType } from "./settings/settings.utils.js";
import { getSettingsConfigFromState, useConfigStateSettings } from "./settings/settings.utils.js";
import type { ConfigurationContextSizingType } from "./size-and-space/size-and-space.utils.js";
import {
  getSizeAndSpaceConfigFromState,
  useConfigStateSizing
} from "./size-and-space/size-and-space.utils.js";

export type ConfigurationContextType = ConfigurationContextColorType &
  ConfigurationContextFontType &
  ConfigurationContextResponseType &
  ConfigurationContextSizingType &
  ConfigurationContextSettingsType &
  ConfigurationContextCustomType & {
    getConfigFromState: () => KeystoneConfig;
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
  // Start setting initial state
  const [color, setColor] = useConfigStateColor(originalConfig);
  const [font, setFont] = useConfigStateFont(originalConfig);
  const [sizing, setSizing] = useConfigStateSizing(originalConfig);
  const [response, setResponse] = useConfigStateResponse(originalConfig);
  const [custom, setCustom] = useConfigStateCustom(originalConfig);
  const [settings, setSettings] = useConfigStateSettings(originalConfig);

  const getConfigFromState = useCallback<ConfigurationContextType["getConfigFromState"]>(() => {
    const configColor = getColorConfigFromState(color);
    const configSizing = getSizeAndSpaceConfigFromState(sizing);
    const configFont = getFontConfigFromState(font);
    const configResponse = getResponseConfigFromState(response);
    const configCustom = getCustomConfigFromState(custom);
    const configSettings = getSettingsConfigFromState(settings);

    const parsableConfig: KeystoneConfig = {
      color: configColor,
      sizeAndSpace: configSizing,
      font: configFont,
      response: configResponse,
      custom: configCustom,
      runtime: configSettings
    };

    const config = ConfigSchema.safeParse(parsableConfig);
    if (config.error) {
      throw config.error;
    }
    return config.data;
  }, [color, custom, font, response, settings, sizing]);

  const value = useMemo<ConfigurationContextType>(
    () => ({
      font,
      setFont,
      color,
      setColor,
      sizing,
      setSizing,
      response,
      setResponse,
      custom,
      setCustom,
      settings,
      setSettings,
      getConfigFromState,
      originalConfig
    }),
    [
      color,
      custom,
      font,
      getConfigFromState,
      originalConfig,
      response,
      setColor,
      setCustom,
      setFont,
      setResponse,
      setSettings,
      setSizing,
      settings,
      sizing
    ]
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

// const config = ConfigSchema.parse({
//   runtime: {
//     namespace: "testing",
//     prefix: "testing",
//   },
//   gridSystem: 4,
//   color: {
//     brand: {
//       type: "manual",
//       colors: {
//         primary: {
//           hex: "#29cbe0",
//           variants: 10,
//         },
//         blue: {
//           hex: "#2651ac",
//           variants: 10,
//         },
//         secondary: {
//           hex: "#a236c9",
//           variants: 4,
//         },
//         third: {
//           hex: "#367bc9",
//           variants: 10,
//         },
//         // scrolling
//         primary2: {
//           hex: "#29cbe0",
//           variants: 10,
//         },
//         blue2: {
//           hex: "#2651ac",
//           variants: 10,
//         },
//         secondary2: {
//           hex: "#a236c9",
//           variants: 4,
//         },
//         third2: {
//           hex: "#367bc9",
//           variants: 10,
//         },
//         brand: {
//           hex: "#326768",
//           variants: {
//             light: "#4da6a8",
//             medium: "#1f3f3f",
//             dark: "#142a2a",
//           },
//         },
//         success: {
//           hex: "#44b430",
//           variants: 3,
//         },
//         warning: {
//           hex: "#d9d43c",
//           variants: 3,
//         },
//         danger: {
//           hex: "#d9513c",
//           variants: 3,
//         },
//         success2: {
//           hex: "#44b430",
//           variants: 3,
//         },
//         warning2: {
//           hex: "#d9d43c",
//           variants: 3,
//         },
//         danger2: {
//           hex: "#d9513c",
//           variants: 3,
//         },
//       },
//     },
//     neutral: {
//       base: "#ccc",
//       "grey-2": "#ddd",
//     },
//   },
//   breakpoints: {},
//   custom: {},
//   font: {},
// } as KeystoneConfig);
