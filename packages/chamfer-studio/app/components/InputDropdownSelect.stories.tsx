import type { Meta, StoryObj } from "@storybook/react";

import { InputDropdownSelect, type InputDropdownSelectProps } from "./InputDropdownSelect";

const meta: Meta = {
  title: "InputDropdownSelect",
  component: InputDropdownSelect
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    dxSize: "dense",
    children: (
      <div
        style={{
          backgroundColor: "rebeccapurple",
          color: "white",
          height: 200,
          width: 300,
          padding: "1rem"
        }}
      >
        I be the dropdown content
      </div>
    )
  } as InputDropdownSelectProps
};

export const WithOffset: Story = {
  args: {
    dxSize: "dense",
    dxOffset: 8,
    children: (
      <div
        style={{
          backgroundColor: "rebeccapurple",
          color: "white",
          height: 200,
          width: 300,
          padding: "1rem"
        }}
      >
        I be the dropdown content
      </div>
    )
  } as InputDropdownSelectProps
};
