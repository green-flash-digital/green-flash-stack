import type { Meta } from "@storybook/react-vite";

import { BasicTooltip } from "./BasicTooltip.js";

const meta: Meta = {
  title: "Popover / Tooltip",
  parameters: {
    layout: "centered"
  }
};
export default meta;

export function Basic() {
  return <BasicTooltip />;
}
