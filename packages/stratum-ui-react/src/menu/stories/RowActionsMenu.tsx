import { useMenu } from "../useMenu.js";
import { menuChromeStyles, menuItemStyles, menuListStyles, triggerStyles } from "./menu.shared-styles.js";

/**
 * One `useMenu` instance scoped to a single row's own component instance —
 * this is the case a module-level singleton controller can't represent (a
 * table of N rows needs N independent menus, created/destroyed as rows
 * mount/unmount/filter/virtualize). React's own component-instance model
 * gives that for free here; there's no registry involved.
 */
function RowActionsMenu({ row }: { row: { id: number; name: string } }) {
  const menu = useMenu();

  return (
    <>
      <button type="button" className={triggerStyles} ref={menu.triggerRef}>
        ⋯
      </button>
      <div ref={menu.menuRef} className={menuChromeStyles}>
        {menu.shouldRenderContent && (
          <ul className={menuListStyles}>
            {["Edit", "Duplicate", "Delete"].map((label, i) => (
              <li key={label}>
                <button
                  type="button"
                  className={menuItemStyles}
                  ref={menu.getItemRef(i)}
                  onClick={() => {
                    // eslint-disable-next-line no-console
                    console.log(`${label} row ${row.id} (${row.name})`);
                    menu.close();
                  }}
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

const rows = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Row ${i + 1}` }));

export function ManyRowMenus() {
  return (
    <table style={{ borderCollapse: "collapse", minWidth: 320 }}>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} style={{ borderBottom: "1px solid rgba(15,23,42,0.08)" }}>
            <td style={{ padding: "0.5rem 1rem" }}>{row.name}</td>
            <td style={{ padding: "0.5rem 1rem", textAlign: "right" }}>
              <RowActionsMenu row={row} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
