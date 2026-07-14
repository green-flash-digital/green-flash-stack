import type { Meta } from "@storybook/react-vite";

import { BasicMenu } from "./BasicMenu.js";
import { PositionedMenu } from "./PositionedMenu.js";
import { ManyRowMenus } from "./RowActionsMenu.js";
import { ScrollContainerMenu } from "./ScrollContainerMenu.js";

const meta: Meta = {
  title: "Popover / Menu",
  parameters: {
    layout: "centered"
  }
};
export default meta;

export function Basic() {
  return <BasicMenu />;
}

export function Positioning() {
  return <PositionedMenu />;
}

export function ManyInstances() {
  return <ManyRowMenus />;
}

export function InScrollContainer() {
  return <ScrollContainerMenu />;
}
