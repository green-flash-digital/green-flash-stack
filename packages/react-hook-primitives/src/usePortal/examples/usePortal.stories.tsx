import type { Meta } from "@storybook/react";

import ExampleUsePortal from "./UsePortal.example.js";
import ExampleUsePortalPositioning from "./UsePortalPositioning.example.js";

const meta: Meta = {
  title: "Hooks / usePortal",
} satisfies Meta<typeof meta>;

export default meta;

export const Base = ExampleUsePortal;
export const Positioning = ExampleUsePortalPositioning;
