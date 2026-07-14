import { useMenu } from "../useMenu.js";
import { menuChromeStyles, menuItemStyles, menuListStyles, triggerStyles } from "./menu.shared-styles.js";

export function BasicMenu() {
  const menu = useMenu();

  return (
    <>
      <button type="button" className={triggerStyles} ref={menu.triggerRef}>
        Actions
      </button>
      <div ref={menu.menuRef} className={menuChromeStyles}>
        {menu.shouldRenderContent && (
          <ul className={menuListStyles}>
            {["Rename", "Duplicate", "Archive", "Delete"].map((label, i) => (
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
