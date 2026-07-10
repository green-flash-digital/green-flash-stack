import type { Meta, StoryObj } from "@storybook/react";

import { InputRange, type InputRangeProps } from "./InputRange";

const meta: Meta = {
  title: "InputRange",
  component: InputRange
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    min: 10,
    max: 80
  } as InputRangeProps
};

export const DisplayMax: Story = {
  args: {
    min: 10,
    max: 80,
    dxDisplayMax: "true"
  }
};

export const DisplayMin: Story = {
  args: {
    min: 10,
    max: 80,
    dxDisplayMax: false,
    dxDisplayMin: true
  }
};

export const DisplayMaxMin: Story = {
  args: {
    min: 10,
    max: 80,
    dxDisplayMax: true,
    dxDisplayMin: true
  }
};

export const DisplayMinMaxWithInput: Story = {
  args: {
    min: 10,
    max: 80,
    dxDisplayMax: true,
    dxDisplayMin: true,
    dxDisplayInput: true
  }
};

export const DisplayInputOnly: Story = {
  args: {
    min: 10,
    max: 80,
    dxDisplayMax: false,
    dxDisplayMin: false,
    dxDisplayInput: true
  }
};

export const VariantHue: Story = {
  args: {
    min: 0,
    max: 360,
    dxDisplayMax: false,
    dxDisplayMin: false,
    dxDisplayInput: true,
    dxVariant: "hue"
  }
};
