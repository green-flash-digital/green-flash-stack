import { useEffect, useState } from "react";

import type { PopoverEnginePosition } from "@stratum-ui/core";

import { useMenu } from "../useMenu.js";
import {
  menuChromeStyles,
  menuItemStyles,
  menuListStyles,
  triggerStyles
} from "./menu.shared-styles.js";

const positionGroups: { label: string; values: PopoverEnginePosition[] }[] = [
  { label: "Top", values: ["top", "top-left", "top-right", "top-span-left", "top-span-right"] },
  { label: "Right", values: ["right", "right-span-top", "right-span-bottom"] },
  {
    label: "Bottom",
    values: ["bottom", "bottom-left", "bottom-right", "bottom-span-left", "bottom-span-right"]
  },
  { label: "Left", values: ["left", "left-span-top", "left-span-bottom"] }
];

/**
 * One `useMenu` instance with live position/offset controls — change either,
 * even while the menu is open, to see it reposition immediately. Backed by
 * `engine.setPosition()`/`setOffset()`, added specifically for this: normally
 * position/offset are fixed at construction, since real usage doesn't
 * typically need to change them after the fact. Radios instead of a select so
 * every option is visible and re-selectable in one click.
 */
export function PositionedMenu() {
  const [position, setPositionValue] = useState<PopoverEnginePosition>("bottom");
  const [offset, setOffsetValue] = useState(8);
  const menu = useMenu({ position, offset });

  useEffect(() => {
    menu.engine.setPosition(position);
  }, [menu.engine, position]);

  useEffect(() => {
    menu.engine.setOffset(offset);
  }, [menu.engine, offset]);

  return (
    <div style={{ display: "flex", gap: "3rem", alignItems: "flex-start", padding: "4rem" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          minWidth: 240
        }}
      >
        <button type="button" className={triggerStyles} ref={menu.triggerRef}>
          Open menu
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
      </div>

      <fieldset
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          border: "1px solid rgba(15, 23, 42, 0.12)",
          borderRadius: "0.75rem",
          padding: "1rem 1.25rem",
          minWidth: 160
        }}
      >
        <legend style={{ fontWeight: 600, fontSize: 13, padding: "0 0.25rem" }}>Position</legend>

        {positionGroups.map((group) => (
          <div key={group.label}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.02em",
                color: "#64748b",
                marginBottom: "0.25rem"
              }}
            >
              {group.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {group.values.map((value) => (
                <label
                  key={value}
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    fontSize: 13,
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="radio"
                    name="menu-position"
                    value={value}
                    checked={position === value}
                    onChange={() => setPositionValue(value)}
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>
        ))}

        <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: 13 }}>
          Offset
          <input
            type="number"
            value={offset}
            onChange={(e) => setOffsetValue(Number(e.target.value))}
            style={{ width: "4rem" }}
          />
        </label>
      </fieldset>
    </div>
  );
}
