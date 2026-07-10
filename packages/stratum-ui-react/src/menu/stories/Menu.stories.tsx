import type { Meta } from "@storybook/react-vite";

import { MenuDemoBasic } from "./basic/index.js";
import { MenuWithCustomPopoverComponent } from "./withCustomPopoverComponent/index.js";
import { MenuWithPositioning } from "./withPositioning/index.js";
import { MenuWithStyle } from "./withStyle/index.js";

const meta: Meta = {
  title: "Popover / Menu",
  parameters: {
    layout: "centered"
  }
};
export default meta;

export function Basic() {
  return (
    <>
      <MenuDemoBasic.Render />
      <button type="button" {...MenuDemoBasic.preloadHandlers} onClick={MenuDemoBasic.openPopover}>
        Show
      </button>
    </>
  );
}

export function WithPositioning() {
  return (
    <>
      <MenuWithPositioning.Render />
      <button
        type="button"
        {...MenuWithPositioning.preloadHandlers}
        onClick={MenuWithPositioning.openPopover}
      >
        Show
      </button>
    </>
  );
}

export function WithStyles() {
  return (
    <>
      <MenuWithStyle.Render />
      <button type="button" {...MenuWithStyle.preloadHandlers} onClick={MenuWithStyle.openPopover}>
        Show
      </button>
    </>
  );
}

export function WithCustomPopoverComponent() {
  return (
    <>
      <MenuWithCustomPopoverComponent.Render />
      <button
        type="button"
        {...MenuWithCustomPopoverComponent.preloadHandlers}
        onClick={MenuWithCustomPopoverComponent.openPopover}
      >
        Show
      </button>
    </>
  );
}
