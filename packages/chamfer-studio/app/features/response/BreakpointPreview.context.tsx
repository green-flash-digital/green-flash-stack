import { type SetStateAction, type FC, type ReactNode, useContext, useMemo } from "react";
import React, { useState } from "react";

type BreakpointPreviewContextType = {
  showMetrics: boolean;
  setShowMetrics: React.Dispatch<SetStateAction<boolean>>;
};
const BreakpointPreviewContext = React.createContext<BreakpointPreviewContextType | null>(null);
export type BreakpointPreviewProviderProps = {
  children: ReactNode;
};
export const BreakpointPreviewProvider: FC<BreakpointPreviewProviderProps> = ({ children }) => {
  const [showMetrics, setShowMetrics] = useState<boolean>(false);

  const value = useMemo<BreakpointPreviewContextType>(
    () => ({
      showMetrics,
      setShowMetrics
    }),
    [showMetrics]
  );

  return (
    <BreakpointPreviewContext.Provider value={value}>{children}</BreakpointPreviewContext.Provider>
  );
};

export const useBreakpointPreviewContext = (): BreakpointPreviewContextType => {
  const context = useContext(BreakpointPreviewContext);
  if (!context) {
    throw new Error(
      "'useBreakpointPreviewContext()' must be used within a <BreakpointPreviewProvider /> component"
    );
  }
  return context;
};
