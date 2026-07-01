import type { Meta, StoryObj } from "@storybook/react";

import { ButtonDropdown, type ButtonDropdownProps } from "./ButtonDropdown";
import { useButtonDropdownContext } from "./ButtonDropdown.context";

const meta: Meta = {
  title: "ButtonDropdown",
  component: ButtonDropdown,
  parameters: {
    layout: "centered"
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

function Children() {
  const { closeDropdown } = useButtonDropdownContext();
  return (
    <div>
      <div>This is some dropdown</div>
      <button type="button" onClick={closeDropdown}>
        close dropdown
      </button>
    </div>
  );
}

export const ContainedDense: Story = {
  args: {
    dxVariant: "contained",
    dxSize: "dense",
    dxLabel: "Button",
    children: <Children />
  } as ButtonDropdownProps
};

export const ContainedNormal: Story = {
  args: {
    dxVariant: "contained",
    dxSize: "normal",
    dxLabel: "Button",
    children: <Children />
  } as ButtonDropdownProps
};

export const OutlinedDense: Story = {
  args: {
    dxVariant: "outlined",
    dxSize: "dense",
    dxLabel: "Button",
    children: <Children />
  } as ButtonDropdownProps
};

export const OutlinedNormal: Story = {
  args: {
    dxVariant: "outlined",
    dxSize: "normal",
    dxLabel: "Button",
    children: <Children />
  } as ButtonDropdownProps
};

export const TextDense: Story = {
  args: {
    dxVariant: "text",
    dxSize: "dense",
    dxLabel: "Button",
    children: <Children />
  } as ButtonDropdownProps
};

export const TextNormal: Story = {
  args: {
    dxVariant: "text",
    dxSize: "normal",
    dxLabel: "Button",
    children: <Children />
  } as ButtonDropdownProps
};
