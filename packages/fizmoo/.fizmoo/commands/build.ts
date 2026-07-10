import { defineCommand, createFizmoo } from "@fizmoo/core";

import { buildOptionsSchema, LOG, validateOptions } from "./_utils/index.js";

export default defineCommand({
  name: "build",
  description: "Build your fizmoo CLI for production",
  options: {
    debug: {
      alias: "d",
      description: "Run with verbose logging",
      type: "boolean"
    },
    autoInit: {
      alias: "ai",
      type: "boolean",
      description: "Automatically create the required directories and files if they aren't present",
      default: true
    }
  },
  action: async ({ options }) => {
    const opts = validateOptions(buildOptionsSchema, {
      logLevel: options.debug ? "debug" : "info",
      autoInit: options.autoInit
    });
    LOG.logLevel = opts.logLevel;

    const fizmoo = await createFizmoo({ ...opts, env: "production" });
    if (!fizmoo) return;
    await fizmoo.build();
  }
});
