import React from "react";
import { type FC, type ReactNode, useContext, useMemo } from "react";

type FontVariantPreviewContextType = {
  sample: string;
};
const FontVariantPreviewContext = React.createContext<FontVariantPreviewContextType | null>(null);
export type FontVariantPreviewProviderProps = {
  children: ReactNode;
};
export const FontVariantPreviewProvider: FC<FontVariantPreviewProviderProps> = ({ children }) => {
  const value = useMemo(
    () => ({
      sample: "sample"
    }),
    []
  );

  return (
    <FontVariantPreviewContext.Provider value={value}>
      {children}
    </FontVariantPreviewContext.Provider>
  );
};

export const useFontVariantPreviewContext = (): FontVariantPreviewContextType => {
  const context = useContext(FontVariantPreviewContext);
  if (!context) {
    throw new Error(
      "'useFontVariantPreviewContext()' must be used within a <FontVariantPreviewProvider /> component"
    );
  }
  return context;
};
