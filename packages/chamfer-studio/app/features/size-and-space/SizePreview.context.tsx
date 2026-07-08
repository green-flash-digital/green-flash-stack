import { type SetStateAction, type FC, type ReactNode, useContext, useMemo } from "react";
import React, { useState } from "react";

type SizePreviewContextType = {
  showGrid: boolean;
  setShowGrid: React.Dispatch<SetStateAction<boolean>>;
};
const SizePreviewContext = React.createContext<SizePreviewContextType | null>(null);
export type SizePreviewProviderProps = {
  children: ReactNode;
};
export const SizePreviewProvider: FC<SizePreviewProviderProps> = ({ children }) => {
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const value = useMemo<SizePreviewContextType>(
    () => ({
      showGrid,
      setShowGrid
    }),
    [showGrid]
  );

  return <SizePreviewContext.Provider value={value}>{children}</SizePreviewContext.Provider>;
};

export const useSizePreviewContext = (): SizePreviewContextType => {
  const context = useContext(SizePreviewContext);
  if (!context) {
    throw new Error(
      "'useSizePreviewContext()' must be used within a <SizePreviewProvider /> component"
    );
  }
  return context;
};
