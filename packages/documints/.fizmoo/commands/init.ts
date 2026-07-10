import { defineCommand } from "fizmoo";

import { bootstrapDocumints } from "../../src/Documints.js";
import { LOG } from "../../src/utils/util.logger.js";

export default defineCommand({
  name: "init",
  description: "Bootstrap a new documints project in the current directory",
  action: async () => {
    LOG.info("Initializing a new documints project...");
    await bootstrapDocumints();
    LOG.success(
      "Done! Run `documints dev` to start the dev server or `documints build` to build for production."
    );
  }
});
