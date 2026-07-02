import type { Meta } from "@storybook/react";

import ToastExample from "./Toast.example.js";
import ToastBestPracticeExample from "./ToastBestPractice.example.js";
import ToastMultipleToastersExample from "./ToastMultipleToasters.example.js";

const meta: Meta = {
  title: "Popovers / Toast",
} satisfies Meta<typeof meta>;

export default meta;

export const Basic = ToastExample;
export const BestPractice = ToastBestPracticeExample;
export const BestMultipleToasters = ToastMultipleToastersExample;
