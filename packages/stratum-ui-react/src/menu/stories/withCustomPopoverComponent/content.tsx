import { useMenuContext } from "../../menu.useMenuContext.js";

export default function Content() {
  const { closeMenu } = useMenuContext();
  return (
    <div>
      <h2>hello</h2>
      <button type="button" onClick={closeMenu}>
        Close action menu
      </button>
    </div>
  );
}
