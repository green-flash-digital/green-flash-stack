import type { Meta, StoryObj } from "@storybook/react";

import { IconFloppyDisk } from "~/icons/IconFloppyDisk";

import { Button, type ButtonProps } from "./Button";

const meta: Meta = {
  title: "Button",
  component: Button,
  parameters: {
    layout: "centered"
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ContainedDense: Story = {
  args: {
    dxVariant: "contained",
    dxSize: "dense",
    children: "Button"
  } as ButtonProps
};

export const ContainedNormal: Story = {
  args: {
    dxVariant: "contained",
    dxSize: "normal",
    children: "Button"
  }
};

export const OutlinedDense: Story = {
  args: {
    dxVariant: "outlined",
    dxSize: "dense",
    children: "Button"
  }
};

export const OutlinedNormal: Story = {
  args: {
    dxVariant: "outlined",
    dxSize: "normal",
    children: "Button"
  }
};

export const TextDense: Story = {
  args: {
    dxVariant: "text",
    dxSize: "dense",
    children: "Button"
  }
};

export const TextNormal: Story = {
  args: {
    dxVariant: "text",
    dxSize: "normal",
    children: "Button"
  }
};

export const IconDense: Story = {
  args: {
    dxVariant: "icon",
    dxSize: "dense",
    DXIcon: IconFloppyDisk
  } as ButtonProps
};

export const IconNormal: Story = {
  args: {
    dxVariant: "icon",
    dxSize: "normal",
    DXIcon: IconFloppyDisk
  } as ButtonProps
};

export const IconBig: Story = {
  args: {
    dxVariant: "icon",
    dxSize: "big",
    DXIcon: IconFloppyDisk
  } as ButtonProps
};
