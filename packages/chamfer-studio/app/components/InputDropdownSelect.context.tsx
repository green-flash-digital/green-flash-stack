import React from "react";
import { type FC, type ReactNode, useContext, useMemo } from "react";

type InputDropdownSelectContextType = {
  onSelect: (value: string) => void;
};
const InputDropdownSelectContext = React.createContext<InputDropdownSelectContextType | null>(null);
export type InputDropdownSelectProviderProps = {
  children: ReactNode;
  onSelect: (value: string) => void;
};
export const InputDropdownSelectProvider: FC<InputDropdownSelectProviderProps> = ({
  children,
  onSelect
}) => {
  const value = useMemo(
    () => ({
      onSelect
    }),
    [onSelect]
  );

  return (
    <InputDropdownSelectContext.Provider value={value}>
      {children}
    </InputDropdownSelectContext.Provider>
  );
};

export const useInputDropdownSelectContext = (): InputDropdownSelectContextType => {
  const context = useContext(InputDropdownSelectContext);
  if (!context) {
    throw new Error(
      "'useInputDropdownSelectContext()' must be used within a <InputDropdownSelectProvider /> component"
    );
  }
  return context;
};
