import type { Meta, StoryObj } from "@storybook/react";

import { InputHue, type InputHueProps } from "./InputHue";

const meta: Meta = {
  title: "InputHue",
  component: InputHue
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {} as InputHueProps
};
