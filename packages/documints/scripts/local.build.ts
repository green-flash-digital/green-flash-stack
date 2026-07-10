import { build } from "../src/cli-scripts/build.js";

/**
 * Runs the `build` cli script locally to test to
 * see if the build will work based upon the resolved
 * .buttery/config file
 */
build({ logLevel: "debug", prompt: true });
