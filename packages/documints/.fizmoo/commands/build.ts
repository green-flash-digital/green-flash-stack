import { defineCommand } from "fizmoo";

import { createDocumints } from "../../src/Documints.js";

export default defineCommand({
  name: "build",
  description: "Build the documints site for production",
  options: {
    "auto-init": {
      type: "boolean",
      description: "Automatically bootstrap .documints/ if it's missing",
      default: false
    }
  },
  action: async ({ options }) => {
    const documints = await createDocumints({ autoInit: options["auto-init"] });
    if (!documints) return;
    await documints.build();
  }
});
