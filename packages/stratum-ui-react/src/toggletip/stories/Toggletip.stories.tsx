import type { Meta } from "@storybook/react-vite";

import { BasicToggletip } from "./BasicToggletip.js";

const meta: Meta = {
  title: "Popover / Toggletip",
  parameters: {
    layout: "centered"
  }
};
export default meta;

export function Basic() {
  return <BasicToggletip />;
}
