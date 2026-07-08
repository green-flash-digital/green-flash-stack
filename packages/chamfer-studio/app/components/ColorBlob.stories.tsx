import type { Meta, StoryObj } from "@storybook/react";

import { ColorBlob } from "./ColorBlob";

const meta: Meta<typeof ColorBlob> = {
  title: "ColorBlob",
  component: ColorBlob,
  decorators: [
    (Story) => (
      <div style={{ height: 44 }}>
        <Story />
      </div>
    )
  ],
  parameters: {
    layout: "centered"
  }
};

export default meta;
type Story = StoryObj<typeof ColorBlob>;

export const CircleHue: Story = {
  args: {
    dxType: "hue",
    dxVariant: "circle",
    dxValue: 40
  }
};

export const CircleHex: Story = {
  args: {
    dxVariant: "circle",
    dxType: "hex",
    dxValue: "248ced"
  }
};

export const SquareHue: Story = {
  args: {
    dxVariant: "square",
    dxType: "hue",
    dxValue: 40
  }
};

export const SquareHex: Story = {
  args: {
    dxVariant: "square",
    dxType: "hex",
    dxValue: "248ced"
  }
};
