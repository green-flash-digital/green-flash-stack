import type { Meta } from "@storybook/react";

import UseTooltipLabelExample from "./UseTooltipLabel.example.js";
import UseTooltipToggletipExample from "./UseTooltipToggletip.example.js";
import UseTooltipWithCountExample from "./UseTooltipWithCount.example.js";
import UseTooltipOverrideArrowColorExample from "./UseTooltipOverrideArrowColor.example.js";

const meta: Meta = {
  title: "Hooks / UseDropdownTooltip",
  parameters: {
    layout: "centered",
  },
};

export default meta;

export const TooltipWithLabel = UseTooltipLabelExample;
export const Toggletip = UseTooltipToggletipExample;
export const TooltipWithCount = UseTooltipWithCountExample;
export const TooltipOverrideArrowColor = UseTooltipOverrideArrowColorExample;
