import type { LogLevel } from "@keystone-css/core";
import { Keystone } from "@keystone-css/core";
import { type Action, defineOptions, type Meta } from "fizmoo";

export const meta: Meta = {
  name: "build",
  description: "Builds keystone-css tokens based upon the set configuration"
};

export const options = defineOptions({
  "log-level": {
    type: "string",
    alias: "l",
    description: "Set's the log level",
    default: "info"
  }
});

export const action: Action<never, typeof options> = async ({ options }) => {
  const logLevel = (options?.["log-level"] as LogLevel) ?? "info";

  const tokens = new Keystone({
    logLevel,
    env: "production",
    autoInit: true
  });
  await tokens.build();
};
