import type { Meta, StoryObj } from "@storybook/react";

import { IconBrush } from "~/icons/IconBrush";
import { IconDelete } from "~/icons/IconDelete";
import { IconFloppyDisk } from "~/icons/IconFloppyDisk";

import { Label, type LabelProps } from "./Label";

const meta: Meta = {
  title: "Label",
  component: Label
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SizeDense: Story = {
  args: {
    dxSize: "dense",
    dxColor: "secondary-400",
    children: "Pending"
  } as LabelProps
};

export const SizeDenseWithIcon: Story = {
  args: {
    dxSize: "dense",
    dxColor: "secondary-400",
    children: "Pending",
    DXIconStart: IconDelete
  } as LabelProps
};

export const SizeNormal: Story = {
  args: {
    dxSize: "normal",
    dxColor: "secondary-400",
    children: "Pending"
  }
};

export const SizeNormalWithIcon: Story = {
  args: {
    dxSize: "normal",
    dxColor: "secondary-400",
    children: "Pending",
    DXIconStart: IconFloppyDisk
  } as LabelProps
};

export const SizeLarge: Story = {
  args: {
    dxSize: "large",
    dxColor: "danger",
    children: "Pending"
  }
};

export const SizeLargeWithIcon: Story = {
  args: {
    dxSize: "large",
    dxColor: "danger",
    children: "Pending",
    DXIconStart: IconBrush
  } as LabelProps
};
