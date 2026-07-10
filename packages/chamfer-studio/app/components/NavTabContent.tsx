import type { ReactNode } from "react";
import ReactDOM from "react-dom";

import { useNavTabsContext } from "./NavTabs.context";

export function NavTabContent(props: { children: ReactNode } & { [key: string]: unknown }) {
  const { activeTab, tabContentRef } = useNavTabsContext();
  if (props["id"] !== activeTab) return null;
  if (!tabContentRef.current) return;

  return ReactDOM.createPortal(props.children, tabContentRef.current);
}
