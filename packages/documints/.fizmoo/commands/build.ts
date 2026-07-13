import { defineCommand } from "fizmoo";

import { Documints } from "../../src/Documints.js";

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
    // Vite's build() uses esbuild's Node API under the hood, which keeps a
    // persistent connection to its background service process open for the
    // life of the calling process - by design, to skip re-paying startup
    // cost across multiple calls. A one-shot CLI command like this one never
    // makes another call, so nothing will ever close that connection on its
    // own; without an explicit exit here the process just sits alive forever
    // even though the build itself already finished (or failed).
    try {
      const documints = await Documints.create({ autoInit: options["auto-init"] });
      if (!documints) return process.exit(0);
      await documints.build();
      process.exit(0);
    } catch {
      process.exit(1);
    }
  }
});
