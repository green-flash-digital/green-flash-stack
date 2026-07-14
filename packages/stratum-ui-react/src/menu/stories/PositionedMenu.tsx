import type { PopoverEnginePosition } from "@stratum-ui/core";

import { useMenu } from "../useMenu.js";
import { menuChromeStyles, menuItemStyles, menuListStyles, triggerStyles } from "./menu.shared-styles.js";

function OneMenu({ position }: { position: PopoverEnginePosition }) {
  const menu = useMenu({ position, offset: 8 });

  return (
    <>
      <button type="button" className={triggerStyles} ref={menu.triggerRef}>
        {position}
      </button>
      <div ref={menu.menuRef} className={menuChromeStyles}>
        {menu.shouldRenderContent && (
          <ul className={menuListStyles}>
            {["One", "Two", "Three"].map((label, i) => (
              <li key={label}>
                <button
                  type="button"
                  className={menuItemStyles}
                  ref={menu.getItemRef(i)}
                  onClick={() => menu.close()}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

const positions: PopoverEnginePosition[] = [
  "top",
  "top-left",
  "top-right",
  "bottom",
  "bottom-left",
  "bottom-right",
  "left",
  "right"
];

/**
 * One `useMenu` instance per button, each with a different `position` — also
 * exercises the `offset` fix (an 8px gap that previously had no visible effect,
 * since `anchor()`'s second argument is a fallback, not an offset).
 */
export function PositionedMenu() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, max-content)",
        gap: "3rem",
        placeItems: "center",
        padding: "4rem"
      }}
    >
      {positions.map((position) => (
        <OneMenu key={position} position={position} />
      ))}
    </div>
  );
}
