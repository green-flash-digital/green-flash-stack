import { useMenu } from "../useMenu.js";
import { menuChromeStyles, menuItemStyles, menuListStyles, triggerStyles } from "./menu.shared-styles.js";

/**
 * The trigger lives inside a short `overflow: hidden` box — a classic dropdown
 * failure case for anything absolutely-positioned relative to a scrolling
 * ancestor. The native Popover API renders in the top layer, so the menu
 * escapes the clipping ancestor entirely without a portal or manual z-index.
 */
export function ScrollContainerMenu() {
  const menu = useMenu({ position: "bottom-right", offset: 8 });

  return (
    <div
      style={{
        width: 260,
        height: 140,
        overflow: "hidden",
        border: "1px dashed rgba(15,23,42,0.3)",
        borderRadius: 8,
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: "0.5rem"
      }}
    >
      <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
        This box clips overflow — the trigger sits at its bottom edge.
      </p>
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
  );
}
