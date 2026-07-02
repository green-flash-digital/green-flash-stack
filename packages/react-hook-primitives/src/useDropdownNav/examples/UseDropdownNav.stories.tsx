import type { Meta } from "@storybook/react";

import UseDropdownNavExample from "./UseDropdownNav.example.js";

const meta: Meta = {
  title: "Hooks / useDropdownNav",
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof meta>;

export default meta;

export const Basic = UseDropdownNavExample;
