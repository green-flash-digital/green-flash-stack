import path from "node:path";

import { Chamfer } from "@chamfer-css/core";

import definition from "../.chamfer/config.js";

const cwd = path.resolve(import.meta.dirname, "..");

export const StudioTokens = new Chamfer({
  logLevel: "trace",
  env: "development",
  definition,
  cwd
});
