import type { Meta, StoryObj } from "@storybook/react";

import { InputCheckbox, type InputCheckboxProps } from "./InputCheckbox";

const meta: Meta = {
  title: "InputCheckbox",
  component: InputCheckbox
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    dxSize: "normal"
  } as InputCheckboxProps
};

export const Big: Story = {
  args: {
    dxSize: "big"
  } as InputCheckboxProps
};
