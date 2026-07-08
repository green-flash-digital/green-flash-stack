import type { LogLevel } from "@keystone-css/core";
import { Keystone } from "@keystone-css/core";
import { defineCommand } from "fizmoo";

export default defineCommand({
  name: "build",
  description: "Builds keystone-css tokens based upon the set configuration",
  options: {
    "log-level": {
      type: "string",
      alias: "l",
      description: "Set the log level",
      default: "info"
    }
  },
  action: async ({ options }) => {
    const tokens = new Keystone({
      logLevel: options["log-level"] as LogLevel,
      env: "production",
      autoInit: true
    });
    await tokens.build();
  }
});
