import { type SetStateAction, type FC, type ReactNode, useContext, useMemo } from "react";
import React, { useState } from "react";

type SpacePreviewContextType = {
  showMetrics: boolean;
  setShowMetrics: React.Dispatch<SetStateAction<boolean>>;
};
const SpacePreviewContext = React.createContext<SpacePreviewContextType | null>(null);
export type SpacePreviewProviderProps = {
  children: ReactNode;
};
export const SpacePreviewProvider: FC<SpacePreviewProviderProps> = ({ children }) => {
  const [showMetrics, setShowMetrics] = useState<boolean>(false);

  const value = useMemo<SpacePreviewContextType>(
    () => ({
      showMetrics,
      setShowMetrics
    }),
    [showMetrics]
  );

  return <SpacePreviewContext.Provider value={value}>{children}</SpacePreviewContext.Provider>;
};

export const useSpacePreviewContext = (): SpacePreviewContextType => {
  const context = useContext(SpacePreviewContext);
  if (!context) {
    throw new Error(
      "'useSpacePreviewContext()' must be used within a <SpacePreviewProvider /> component"
    );
  }
  return context;
};
