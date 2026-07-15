import {
  type SetStateAction,
  type FC,
  type ReactNode,
  useContext,
  useMemo,
  useEffect
} from "react";
import React, { useState } from "react";
import { useToggle } from "@stratum-ui/react/toggle";

import type { Updater } from "use-immer";
import { useImmer } from "use-immer";

import { colorThemeMap } from "./color.utils";

export type ColorPreviewThemeMode = "light" | "dark";
export type ColorPreviewWCAGValues = {
  fontSize: number;
  bgColor: string;
};

type ColorPreviewContextType = {
  themeMode: ColorPreviewThemeMode;
  setThemeMode: React.Dispatch<SetStateAction<ColorPreviewThemeMode>>;
  showWCAG: boolean;
  toggleWCAG: () => void;
  wcagValues: ColorPreviewWCAGValues;
  setWcagValues: Updater<ColorPreviewWCAGValues>;
};
const ColorPreviewContext = React.createContext<ColorPreviewContextType | null>(null);
export type ColorPreviewProviderProps = {
  children: ReactNode;
};
export const ColorPreviewProvider: FC<ColorPreviewProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ColorPreviewThemeMode>("light");
  const [showWCAG, toggleWCAG] = useToggle(false);
  const [wcagValues, setWcagValues] = useImmer<ColorPreviewWCAGValues>({
    fontSize: 16,
    bgColor: "#FFFFFF"
  });

  useEffect(() => {
    setWcagValues((draft) => {
      draft.bgColor = colorThemeMap[themeMode];
    });
  }, [setWcagValues, themeMode]);

  const value = useMemo<ColorPreviewContextType>(
    () => ({
      themeMode,
      setThemeMode,
      showWCAG,
      toggleWCAG,
      wcagValues,
      setWcagValues
    }),
    [setWcagValues, showWCAG, themeMode, toggleWCAG, wcagValues]
  );

  return <ColorPreviewContext.Provider value={value}>{children}</ColorPreviewContext.Provider>;
};

export const useColorPreviewContext = (): ColorPreviewContextType => {
  const context = useContext(ColorPreviewContext);
  if (!context) {
    throw new Error(
      "'useColorPreviewContext()' must be used within a <ColorPreviewProvider /> component"
    );
  }
  return context;
};
