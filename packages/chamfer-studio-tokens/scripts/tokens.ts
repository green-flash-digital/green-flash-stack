import path from "node:path";

import { Keystone } from "@keystone-css/core";

import definition from "../.keystone/config.js";

const cwd = path.resolve(import.meta.dirname, "..");

export const StudioTokens = new Keystone({
  logLevel: "trace",
  env: "development",
  definition,
  cwd
});
