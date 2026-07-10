import { NavLink } from "react-router";

import { useMenuContext } from "@stratum-ui/react/menu";

import type { ButteryDocsConfigHeaderLinkTypeDropdown } from "../../../config/_config.utils.js";

export type LayoutHeaderLinksTypeDropdownState = {
  items: ButteryDocsConfigHeaderLinkTypeDropdown["items"];
};

export default function LayoutHeaderLinksTypeDropdownContent() {
  const { state } = useMenuContext<LayoutHeaderLinksTypeDropdownState>();

  return (
    <ul>
      {state.items.map((item) => (
        <li key={item.href}>
          <NavLink to={item.href}>
            <img src={item.iconSrc} alt={item.iconAlt} />
            <div>
              <div className="title">{item.text}</div>
              {item.subText && <div className="sub-title">{item.subText}</div>}
            </div>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
