import type { LogLevel } from "@keystone-css/core";
import { Keystone } from "@keystone-css/core";
import { StudioServer } from "@keystone-css/studio/server";
import { defineOptions, type Action, type Meta } from "fizmoo";

export const meta: Meta = {
  name: "studio",
  description: "Launches the interactive tokens studio in a local development environment"
};

export const options = defineOptions({
  "log-level": {
    type: "string",
    alias: "l",
    description: "Set's the log level",
    default: "info"
  },
  port: {
    type: "number",
    description: "The port the studio will run from on localhost",
    default: 5700,
    alias: "p",
    required: false
  }
});

export const action: Action<never, typeof options> = async ({ options }) => {
  const logLevel = (options?.["log-level"] as LogLevel) ?? "info";

  const tokens = new Keystone({
    logLevel,
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
};
