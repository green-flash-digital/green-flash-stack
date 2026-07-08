import { type SetStateAction, type FC, type ReactNode, useContext, useMemo } from "react";
import React, { useState } from "react";

type CustomPreviewContextType = {
  showMetrics: boolean;
  setShowMetrics: React.Dispatch<SetStateAction<boolean>>;
};
const CustomPreviewContext = React.createContext<CustomPreviewContextType | null>(null);
export type CustomPreviewProviderProps = {
  children: ReactNode;
};
export const CustomPreviewProvider: FC<CustomPreviewProviderProps> = ({ children }) => {
  const [showMetrics, setShowMetrics] = useState<boolean>(false);

  const value = useMemo<CustomPreviewContextType>(
    () => ({
      showMetrics,
      setShowMetrics
    }),
    [showMetrics]
  );

  return <CustomPreviewContext.Provider value={value}>{children}</CustomPreviewContext.Provider>;
};

export const useCustomPreviewContext = (): CustomPreviewContextType => {
  const context = useContext(CustomPreviewContext);
  if (!context) {
    throw new Error(
      "'useCustomPreviewContext()' must be used within a <CustomPreviewProvider /> component"
    );
  }
  return context;
};
