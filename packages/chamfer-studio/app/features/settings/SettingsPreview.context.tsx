import { type SetStateAction, type FC, type ReactNode, useContext, useMemo } from "react";
import React, { useState } from "react";

type SettingsPreviewContextType = {
  showMetrics: boolean;
  setShowMetrics: React.Dispatch<SetStateAction<boolean>>;
};
const SettingsPreviewContext = React.createContext<SettingsPreviewContextType | null>(null);
export type SettingsPreviewProviderProps = {
  children: ReactNode;
};
export const SettingsPreviewProvider: FC<SettingsPreviewProviderProps> = ({ children }) => {
  const [showMetrics, setShowMetrics] = useState<boolean>(false);

  const value = useMemo<SettingsPreviewContextType>(
    () => ({
      showMetrics,
      setShowMetrics
    }),
    [showMetrics]
  );

  return (
    <SettingsPreviewContext.Provider value={value}>{children}</SettingsPreviewContext.Provider>
  );
};

export const useSettingsPreviewContext = (): SettingsPreviewContextType => {
  const context = useContext(SettingsPreviewContext);
  if (!context) {
    throw new Error(
      "'useSettingsPreviewContext()' must be used within a <SettingsPreviewProvider /> component"
    );
  }
  return context;
};
