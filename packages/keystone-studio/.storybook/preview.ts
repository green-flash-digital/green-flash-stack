import type { Preview } from "@storybook/react";
import "@keystone@keystone-css/studio-tokens/root.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
};

export default preview;
