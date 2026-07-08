import React from "react";
import { type FC, type ReactNode, useContext, useMemo } from "react";

type ButtonDropdownContextType = {
  closeDropdown: () => void;
};
const ButtonDropdownContext = React.createContext<ButtonDropdownContextType | null>(null);
export type ButtonDropdownProviderProps = {
  closeDropdown: () => void;
  children: ReactNode;
};
export const ButtonDropdownProvider: FC<ButtonDropdownProviderProps> = ({
  children,
  closeDropdown
}) => {
  const value = useMemo(
    () => ({
      closeDropdown
    }),
    [closeDropdown]
  );

  return <ButtonDropdownContext.Provider value={value}>{children}</ButtonDropdownContext.Provider>;
};

export const useButtonDropdownContext = (): ButtonDropdownContextType => {
  const context = useContext(ButtonDropdownContext);
  if (!context) {
    throw new Error(
      "'useButtonDropdownContext()' must be used within a <ButtonDropdownProvider /> component"
    );
  }
  return context;
};
