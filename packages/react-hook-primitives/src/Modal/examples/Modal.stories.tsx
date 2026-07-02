import type { Meta } from "@storybook/react";

import ModalBaseExample from "./ModalBase.example.js";
import ModalBasicExample from "./ModalBasic.example.js";
// import ModalWithNestedFormsExample from "./ModalWithNestedForms.example.js";

const meta: Meta = {
  title: "Modals / Modal",
} satisfies Meta<typeof meta>;

export default meta;

export const Base = ModalBaseExample;
export const Basic = ModalBasicExample;
// export const WithNestedForms = ModalWithNestedFormsExample;
