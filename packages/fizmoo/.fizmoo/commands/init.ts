import { defineCommand, bootstrap } from "@fizmoo/core";
import { LOG } from "./_utils/index.js";

export default defineCommand({
  name: "init",
  description: "Bootstrap a new fizmoo project in the current directory",
  options: {
    debug: {
      alias: "d",
      description: "Run with verbose logging",
      type: "boolean",
    },
  },
  action: async ({ options }) => {
    if (options.debug) LOG.logLevel = "debug";

    LOG.info("Initializing a new fizmoo project...");
    await bootstrap();
    LOG.success(
      'Done! Run `fizmoo build` to compile your CLI or `fizmoo dev` to start the watcher.'
    );
  },
});
