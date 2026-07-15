import type { Meta } from "@storybook/react-vite";

import { RowContextMenus } from "./RowContextMenu.js";

const meta: Meta = {
  title: "Popover / Context Menu",
  parameters: {
    layout: "centered"
  }
};
export default meta;

export function Basic() {
  return <RowContextMenus />;
}
