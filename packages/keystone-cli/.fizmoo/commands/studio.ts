import type { LogLevel } from "@keystone-css/core";
import { Keystone } from "@keystone-css/core";
import { StudioServer } from "@keystone-css/studio/server";
import { defineCommand } from "fizmoo";

export default defineCommand({
  name: "studio",
  description: "Launches the interactive tokens studio in a local development environment",
  options: {
    "log-level": {
      type: "string",
      alias: "l",
      description: "Set the log level",
      default: "info"
    },
    port: {
      type: "number",
      alias: "p",
      description: "The port the studio will run from on localhost",
      default: 5700
    }
  },
  action: async ({ options }) => {
    const tokens = new Keystone({
      logLevel: options["log-level"] as LogLevel,
      env: "development",
      autoInit: true
    });

    try {
      const config = await tokens.getConfig();
      const server = new StudioServer({
        port: options.port,
        configPath: config.meta.filePath,
        versionsDir: config.dirs.versions
      });
      server.listen();
    } catch (error) {
      tokens.printError(error);
    }
  }
});
