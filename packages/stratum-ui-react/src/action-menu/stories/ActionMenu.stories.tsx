import { ActionMenuDemoBasic } from "./basic/index.js";

const meta = {
  title: "Popover / ActionMenu",
};
export default meta;

export function Basic() {
  return (
    <>
      <ActionMenuDemoBasic.Render />
      <button type="button" onClick={ActionMenuDemoBasic.openPopover}>
        Show Basic Action Menu
      </button>
    </>
  );
}
