import type { Meta } from "@storybook/react";

import UseDropdownExample from "./UseDropdown.example.js";
import UseDropdownPositioningExample from "./UseDropdownPositioning.example.js";

const meta: Meta = {
  title: "Hooks / useDropdown",
  parameters: {
    layout: "centered"
  }
} satisfies Meta<typeof meta>;

export default meta;

export const Base = UseDropdownExample;
export const Positioning = UseDropdownPositioningExample;
