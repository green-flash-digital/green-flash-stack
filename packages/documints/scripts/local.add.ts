import path from "node:path";

import { add } from "../src/cli-scripts/add.js";

/**
 * Runs the `add` cli script locally to test to
 * test out and validate the template is working
 */

add(path.resolve(import.meta.dirname, "/test/how-to"), {
  logLevel: "info",
  prompt: true,
  template: true,
});
