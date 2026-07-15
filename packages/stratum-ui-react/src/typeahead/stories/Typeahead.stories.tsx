import type { Meta } from "@storybook/react-vite";

import { ApiSearchTypeahead } from "./ApiSearchTypeahead.js";
import { MultiSelectTypeahead } from "./MultiSelectTypeahead.js";
import { SingleSelectTypeahead } from "./SingleSelectTypeahead.js";

const meta: Meta = {
  title: "Popover / Typeahead",
  parameters: {
    layout: "centered"
  }
};
export default meta;

export function SingleSelect() {
  return <SingleSelectTypeahead />;
}

export function MultiSelect() {
  return <MultiSelectTypeahead />;
}

export function ApiSearch() {
  return <ApiSearchTypeahead />;
}
