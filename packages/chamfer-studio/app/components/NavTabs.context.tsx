import {
  type RefCallback,
  type SetStateAction,
  type Dispatch,
  type FC,
  type ReactNode,
  useContext,
  useMemo,
  useRef,
  useCallback
} from "react";
import React, { useState } from "react";

import type { NavTabsPropsCustom } from "./NavTabs";

type NavTabsContextType = {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  tabContentRef: React.MutableRefObject<HTMLDivElement | null>;
};
const NavTabsContext = React.createContext<NavTabsContextType | null>(null);
export type NavTabsContextProviderProps = {
  children: ReactNode;
} & NavTabsPropsCustom;

export const NavTabsContextProvider: FC<NavTabsContextProviderProps> = ({
  children,
  dxInitActiveTab = ""
}) => {
  const [activeTab, setActiveTab] = useState("");
  const tabContentRef = useRef<HTMLDivElement | null>(null);

  const callbackRef = useCallback<RefCallback<HTMLDivElement>>(
    (node) => {
      if (!node) return;
      tabContentRef.current = node;
      setActiveTab(dxInitActiveTab);
    },
    [dxInitActiveTab]
  );

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      tabContentRef
    }),
    [activeTab]
  );

  return (
    <NavTabsContext.Provider value={value}>
      {children}
      {dxInitActiveTab && <div ref={callbackRef} />}
    </NavTabsContext.Provider>
  );
};

export const useNavTabsContext = (): NavTabsContextType => {
  const context = useContext(NavTabsContext);
  if (!context) {
    throw new Error(
      "'useNavTabsContext()' must be used within a <NavTabsContextProvider /> component"
    );
  }
  return context;
};
