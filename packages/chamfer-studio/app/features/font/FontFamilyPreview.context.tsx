import { type SetStateAction, type FC, type ReactNode, useContext, useMemo } from "react";
import React, { useState } from "react";

const initSampleText = "Curious minds discover joy in the beauty of everyday moments.";

type FontFamilyPreviewContextType = {
  displayCustomTextarea: boolean;
  setDisplayCustomTextarea: React.Dispatch<SetStateAction<boolean>>;
  sampleText: string;
  setSampleText: React.Dispatch<SetStateAction<string>>;
  fontSize: number;
  setFontSize: React.Dispatch<SetStateAction<number>>;
};
const FontFamilyPreviewContext = React.createContext<FontFamilyPreviewContextType | null>(null);
export type FontFamilyPreviewProviderProps = {
  children: ReactNode;
};
export const FontFamilyPreviewProvider: FC<FontFamilyPreviewProviderProps> = ({ children }) => {
  const [displayCustomTextarea, setDisplayCustomTextarea] = useState(false);
  const [sampleText, setSampleText] = useState<string>(initSampleText);
  const [fontSize, setFontSize] = useState<number>(16);

  const value = useMemo<FontFamilyPreviewContextType>(
    () => ({
      displayCustomTextarea,
      setDisplayCustomTextarea,
      fontSize,
      setFontSize,
      sampleText,
      setSampleText
    }),
    [displayCustomTextarea, fontSize, sampleText]
  );

  return (
    <FontFamilyPreviewContext.Provider value={value}>{children}</FontFamilyPreviewContext.Provider>
  );
};

export const useFontFamilyPreviewContext = (): FontFamilyPreviewContextType => {
  const context = useContext(FontFamilyPreviewContext);
  if (!context) {
    throw new Error(
      "'useFontFamilyPreviewContext()' must be used within a <FontFamilyPreviewProvider /> component"
    );
  }
  return context;
};
