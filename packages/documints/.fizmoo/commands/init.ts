import { Documints } from "../../src/Documints.js";
import { LOG } from "../../src/utils/util.logger.js";
import { defineCommand } from "fizmoo";

export default defineCommand({
  name: "init",
  description: "Bootstrap a new documints project in the current directory",
  action: async () => {
    try {
      LOG.info("Initializing a new documints project...");
      await Documints.bootstrap();
      LOG.success(
        "Done! Run `documints dev` to start the dev server or `documints build` to build for production."
      );
      process.exit(0);
    } catch {
      process.exit(1);
    }
  }
});
