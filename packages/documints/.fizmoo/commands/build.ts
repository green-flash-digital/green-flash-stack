import { Documints } from "@documints/core";
import { defineCommand } from "fizmoo";

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
    // Must be set before Documints.create() resolves directories, since which
    // server entry file gets picked (entry.server.static.tsx vs
    // entry.server.tsx) depends on NODE_ENV at that point.
    process.env.NODE_ENV = "production";
    const documints = await Documints.create({ autoInit: options["auto-init"] });
    if (!documints) return;
    await documints.build();
  }
});
