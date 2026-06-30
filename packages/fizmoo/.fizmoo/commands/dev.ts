import { defineCommand, createFizmoo } from "@fizmoo/core";
import { devOptionsSchema, LOG, validateOptions } from "./_utils/index.js";

export default defineCommand({
  name: "dev",
  description: "Start the fizmoo development server — rebuilds on file changes",
  options: {
    debug: {
      alias: "d",
      description: "Run with verbose logging",
      type: "boolean",
    },
    autoInit: {
      alias: "ai",
      type: "boolean",
      description:
        "Automatically create the required directories and files if they aren't present",
      default: true,
    },
  },
  action: async ({ options }) => {
    const opts = validateOptions(devOptionsSchema, {
      logLevel: options.debug ? "debug" : "info",
      autoInit: options.autoInit,
    });
    LOG.logLevel = opts.logLevel;

    const fizmoo = await createFizmoo({ ...opts, env: "development" });
    if (!fizmoo) return;
    await fizmoo.dev();
  },
});
