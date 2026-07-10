import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { type TooltipVariant, Tooltip, useTooltip, type TooltipProps } from "./Tooltip";

const meta: Meta = {
  title: "Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered"
  }
} satisfies Meta<typeof meta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const VariantDark: Story = {
  args: {
    dxVariant: "dark",
    children:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ex, aspernatur eum molestias aliquid necessitatibus dicta sed dolor totam inventore aliquam dolores alias, a, quia quas deserunt debitis tempora nobis facilis."
  } as TooltipProps
};

const variants: TooltipVariant[] = ["dark", "light"];

export const WithTarget = () => {
  const [variant, setVariant] = useState<TooltipVariant>("dark");
  const { setTargetRef, setTooltipRef } = useTooltip({
    dxType: "tooltip",
    dxPosition: "top-center",
    dxArrow: {
      size: 8
    }
  });

  return (
    <>
      <div style={{ marginBottom: "3rem" }}>
        <select
          defaultValue={variant}
          onChange={(e) => {
            setVariant(e.currentTarget.value as TooltipVariant);
          }}
        >
          {variants.map((v) => (
            <option value={v} key={v}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <button ref={setTargetRef} type="button">
        view tooltip
      </button>
      <Tooltip ref={setTooltipRef} dxVariant={variant}>
        <div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia, ducimus numquam. Fugiat
          voluptas ab quos nihil, pariatur natus nemo eligendi, dicta reiciendis deleniti at labore
          laborum excepturi quod delectus laudantium?
        </div>
      </Tooltip>
    </>
  );
};

export const VariantLight: Story = {
  args: {
    dxVariant: "light",
    children:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia, ducimus numquam. Fugiat voluptas ab quos nihil, pariatur natus nemo eligendi, dicta reiciendis deleniti at labore laborum excepturi quod delectus laudantium?"
  }
};
