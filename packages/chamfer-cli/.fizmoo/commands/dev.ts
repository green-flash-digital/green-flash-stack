import type { LogLevel } from "@chamfer-css/core";
import { Chamfer } from "@chamfer-css/core";
import { defineCommand } from "fizmoo";

export default defineCommand({
  name: "dev",
  description: "Watches for changes in the configuration and re-builds the tokens",
  options: {
    "log-level": {
      type: "string",
      alias: "l",
      description: "Set the log level",
      default: "info"
    }
  },
  action: async ({ options }) => {
    const tokens = new Chamfer({
      logLevel: options["log-level"] as LogLevel,
      env: "development",
      autoInit: true
    });
    await tokens.dev();
  }
});
