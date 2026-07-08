import type { Meta } from "@storybook/react";

import { IconCopy } from "~/icons/IconCopy";
import { IconDownload05 } from "~/icons/IconDownload05";
import { IconFloppyDisk } from "~/icons/IconFloppyDisk";

import { Button } from "./Button";
import { ButtonDropdown } from "./ButtonDropdown";
import { ButtonGroup } from "./ButtonGroup";

const meta: Meta = {
  title: "ButtonGroup",
  component: ButtonGroup
};

export default meta;

export const WithDropdownAtEnd = () => {
  return (
    <ButtonGroup>
      <Button dxVariant="outlined" DXIconStart={IconCopy}>
        Copy
      </Button>
      <Button dxVariant="outlined" DXIconStart={IconDownload05}>
        Export
      </Button>
      <ButtonDropdown dxVariant="outlined" DXIconStart={IconFloppyDisk} dxLabel="Save">
        Save
      </ButtonDropdown>
    </ButtonGroup>
  );
};

export const WithDropdownInMiddle = () => {
  return (
    <ButtonGroup>
      <Button dxVariant="outlined" DXIconStart={IconCopy}>
        Copy
      </Button>
      <ButtonDropdown dxVariant="outlined" DXIconStart={IconFloppyDisk} dxLabel="Save">
        Save
      </ButtonDropdown>
      <Button dxVariant="outlined" DXIconStart={IconDownload05}>
        Export
      </Button>
    </ButtonGroup>
  );
};

export const WithDropdownAtStart = () => {
  return (
    <ButtonGroup>
      <ButtonDropdown dxVariant="outlined" DXIconStart={IconFloppyDisk} dxLabel="Save">
        Save
      </ButtonDropdown>
      <Button dxVariant="outlined" DXIconStart={IconCopy}>
        Copy
      </Button>

      <Button dxVariant="outlined" DXIconStart={IconDownload05}>
        Export
      </Button>
    </ButtonGroup>
  );
};
