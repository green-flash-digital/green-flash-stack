import { NavLink } from "react-router";

import type { DocumintConfigHeaderLinkTypeDropdown } from "../../config/config.utils.js";

export type LayoutHeaderLinksTypeDropdownContentProps = {
  items: DocumintConfigHeaderLinkTypeDropdown["items"];
  getItemRef: (index: number) => (node: HTMLAnchorElement | null) => void;
};

export default function LayoutHeaderLinksTypeDropdownContent({
  items,
  getItemRef
}: LayoutHeaderLinksTypeDropdownContentProps) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={item.href}>
          <NavLink to={item.href} ref={getItemRef(i)}>
            {item.iconSrc && <img src={item.iconSrc} alt={item.iconAlt} />}
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
