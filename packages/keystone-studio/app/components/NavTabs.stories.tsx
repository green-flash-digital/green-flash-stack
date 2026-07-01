import type { Meta } from "@storybook/react";

import { NavTab } from "./NavTab";
import { NavTabContent } from "./NavTabContent";
import { NavTabLabel } from "./NavTabLabel";
import { NavTabs } from "./NavTabs";

const meta: Meta = {
  title: "NavTabs",
  component: NavTabs
};

export default meta;

export const StatefulRegularPrimary = () => {
  return (
    <NavTabs dxInitActiveTab="diff">
      <ul>
        <li>
          <NavTab id="diff">
            <NavTabLabel>Tab 1</NavTabLabel>
            <NavTabContent>Tab 1 content</NavTabContent>
          </NavTab>
        </li>
        <li>
          <NavTab id="version-history">
            <NavTabLabel>Tab 2</NavTabLabel>
            <NavTabContent>Tab 2 content</NavTabContent>
          </NavTab>
        </li>
      </ul>
    </NavTabs>
  );
};

export const StatefulRegularSecondary = () => {
  return (
    <NavTabs dxInitActiveTab="diff" dxColor="secondary">
      <ul>
        <li>
          <NavTab id="diff">
            <NavTabLabel>Tab 1</NavTabLabel>
            <NavTabContent>Tab 1 content</NavTabContent>
          </NavTab>
        </li>
        <li>
          <NavTab id="version-history">
            <NavTabLabel>Tab 2</NavTabLabel>
            <NavTabContent>Tab 2 content</NavTabContent>
          </NavTab>
        </li>
      </ul>
    </NavTabs>
  );
};

export const StatefulDensePrimary = () => {
  return (
    <NavTabs dxInitActiveTab="diff" dxSize="dense" dxColor="primary">
      <ul>
        <li>
          <NavTab id="diff">
            <NavTabLabel>Tab 1</NavTabLabel>
            <NavTabContent>Tab 1 content</NavTabContent>
          </NavTab>
        </li>
        <li>
          <NavTab id="version-history">
            <NavTabLabel>Tab 2</NavTabLabel>
            <NavTabContent>Tab 2 content</NavTabContent>
          </NavTab>
        </li>
      </ul>
    </NavTabs>
  );
};

export const StatefulDenseSecondary = () => {
  return (
    <NavTabs dxInitActiveTab="diff" dxSize="dense" dxColor="secondary">
      <ul>
        <li>
          <NavTab id="diff">
            <NavTabLabel>Tab 1</NavTabLabel>
            <NavTabContent>Tab 1 content</NavTabContent>
          </NavTab>
        </li>
        <li>
          <NavTab id="version-history">
            <NavTabLabel>Tab 2</NavTabLabel>
            <NavTabContent>Tab 2 content</NavTabContent>
          </NavTab>
        </li>
      </ul>
    </NavTabs>
  );
};
