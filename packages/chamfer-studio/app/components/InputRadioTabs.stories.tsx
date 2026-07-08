import type { Meta } from "@storybook/react";

import { InputRadioTab } from "./InputRadioTab";
import { InputRadioTabs } from "./InputRadioTabs";

const meta: Meta = {
  title: "InputRadioTabs"
};

export default meta;

export const Dense = () => {
  return (
    <InputRadioTabs>
      <InputRadioTab
        defaultChecked
        dxSize="dense"
        name="test"
        dxLabel="option 1"
        value="option_1"
      />
      <InputRadioTab dxSize="dense" name="test" dxLabel="option 2" value="option_2" />
      <InputRadioTab dxSize="dense" name="test" dxLabel="option 3" value="option_3" />
    </InputRadioTabs>
  );
};
export const DenseWithSubLabels = () => {
  return (
    <InputRadioTabs>
      <InputRadioTab
        defaultChecked
        dxSize="dense"
        name="test"
        dxLabel="option 1"
        dxSubLabel="Sed posuere consectetur est at lobortis."
        value="option_1"
      />
      <InputRadioTab
        dxSize="dense"
        name="test"
        dxLabel="option 2"
        dxSubLabel="Sed posuere consectetur est at lobortis."
        value="option_2"
      />
      <InputRadioTab
        dxSize="dense"
        name="test"
        dxLabel="option 3"
        dxSubLabel="Sed posuere consectetur est at lobortis."
        value="option_3"
      />
    </InputRadioTabs>
  );
};
