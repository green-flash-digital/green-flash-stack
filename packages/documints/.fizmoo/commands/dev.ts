import { Documints } from "@documints/core";
import { defineCommand } from "fizmoo";

export default defineCommand({
  name: "dev",
  description: "Start the documints development server",
  options: {
    port: {
      type: "number",
      alias: "p",
      description: "Port to run the dev server on",
      default: 3000
    },
    host: {
      type: "string",
      description: "Host to bind the dev server to",
      default: "localhost"
    },
    open: {
      type: "boolean",
      alias: "o",
      description: "Open the dev server in your browser",
      default: false
    },
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
    process.env.NODE_ENV = "development";
    const documints = await Documints.create({ autoInit: options["auto-init"] });
    if (!documints) return;
    await documints.dev({
      port: options.port,
      host: options.host,
      open: options.open
    });
  }
});
