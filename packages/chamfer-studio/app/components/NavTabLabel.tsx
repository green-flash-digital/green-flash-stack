import { type MouseEventHandler, useCallback, useMemo } from "react";

import { useNavTabsContext } from "./NavTabs.context";

export function NavTabLabel(props: { children: string } & { [key: string]: string }) {
  const { activeTab, setActiveTab } = useNavTabsContext();

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(() => {
    setActiveTab(props.id);
  }, [setActiveTab, props.id]);

  const className = useMemo(() => {
    if (activeTab === props.id) return "active";
    return undefined;
  }, [activeTab, props.id]);

  return useMemo(
    () => (
      <button onClick={handleClick} className={className}>
        {props.children}
      </button>
    ),
    [props.children, className, handleClick]
  );
}
