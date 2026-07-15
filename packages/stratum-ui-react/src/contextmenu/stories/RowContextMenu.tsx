import { useContextMenu } from "../useContextMenu.js";
import { menuChromeStyles, menuItemStyles, menuListStyles } from "../../menu/stories/menu.shared-styles.js";

function ContextMenuRow({ row }: { row: { id: number; name: string } }) {
  const menu = useContextMenu();

  return (
    <>
      <tr ref={menu.targetRef} style={{ borderBottom: "1px solid rgba(15,23,42,0.08)" }}>
        <td style={{ padding: "0.5rem 1rem" }}>{row.name}</td>
        <td style={{ padding: "0.5rem 1rem", textAlign: "right", color: "#94a3b8", fontSize: 12 }}>
          right-click
        </td>
      </tr>
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

const rows = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: `Row ${i + 1}` }));

/**
 * Same underlying menu semantics as `ManyRowMenus` in the Menu stories (one
 * `useContextMenu` instance per row, no registry involved), but triggered by
 * right-click and anchored to the cursor instead of a "⋯" button.
 */
export function RowContextMenus() {
  return (
    <table style={{ borderCollapse: "collapse", minWidth: 320 }}>
      <tbody>
        {rows.map((row) => (
          <ContextMenuRow key={row.id} row={row} />
        ))}
      </tbody>
    </table>
  );
}
