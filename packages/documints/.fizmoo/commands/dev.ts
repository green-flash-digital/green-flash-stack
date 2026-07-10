import { defineCommand } from "fizmoo";

import { createDocumints } from "../../src/Documints.js";

export default defineCommand({
  name: "dev",
  description: "Start the documints development server",
  options: {
    port: {
      type: "number",
      alias: "p",
      description: "Port to run the dev server on",
      default: 3000,
    },
    host: {
      type: "string",
      description: "Host to bind the dev server to",
      default: "localhost",
    },
    open: {
      type: "boolean",
      alias: "o",
      description: "Open the dev server in your browser",
      default: false,
    },
    "auto-init": {
      type: "boolean",
      description: "Automatically bootstrap .documints/ if it's missing",
      default: false,
    },
  },
  action: async ({ options }) => {
    const documints = await createDocumints({ autoInit: options["auto-init"] });
    if (!documints) return;
    await documints.dev({ port: options.port, host: options.host, open: options.open });
  },
});
