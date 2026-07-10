import { build as buildIcons } from "@buttery/icons/cli/build";
import { build as buildTokens } from "@buttery/tokens/cli/build";

import { LOG } from "../src/utils/util.logger.js";

try {
  // build the scripts
  await buildIcons({ prompt: false, logLevel: "debug" });
  await buildTokens();
} catch (error) {
  LOG.fatal(
    new Error(
      `Error when building the @buttery/docs for distribution: ${error}`
    )
  );
}
