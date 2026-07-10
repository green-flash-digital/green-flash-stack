import type { LogLevel } from "@chamfer-css/core";
import { Chamfer } from "@chamfer-css/core";
import { defineCommand } from "fizmoo";

export default defineCommand({
  name: "build",
  description: "Builds chamfer-css tokens based upon the set configuration",
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
      env: "production",
      autoInit: true
    });
    await tokens.build();
  }
});
