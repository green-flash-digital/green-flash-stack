import { Documints, LOG } from "@documints/core";
import { defineCommand } from "fizmoo";

export default defineCommand({
  name: "init",
  description: "Bootstrap a new documints project in the current directory",
  action: async () => {
    LOG.info("Initializing a new documints project...");
    await Documints.bootstrap();
    LOG.success(
      "Done! Run `documints dev` to start the dev server or `documints build` to build for production."
    );
  }
});
