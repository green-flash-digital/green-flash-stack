import { useActionMenuContext } from "../../action-menu.useActionMenuContext.js";

export default function Content() {
  const { closeActionMenu } = useActionMenuContext();
  return (
    <div>
      <h2>hello</h2>
      <button type="button" onClick={closeActionMenu}>
        Close action menu
      </button>
    </div>
  );
}
