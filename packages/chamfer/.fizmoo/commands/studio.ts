import path from "node:path";

import { findChamferTokensFile } from "@chamfer-css/core";
import { StudioServer } from "@chamfer-css/studio/server";
import { defineCommand } from "fizmoo";

export default defineCommand({
  name: "studio",
  description: "Launches the interactive tokens studio in a local development environment",
  options: {
    port: {
      type: "number",
      alias: "p",
      description: "The port the studio will run from on localhost",
      default: 5700
    }
  },
  action: async ({ options }) => {
    const tokensPath = await findChamferTokensFile(process.cwd());
    if (!tokensPath) {
      throw new Error('Could not locate ".chamfer/tokens.json". Run `chamfer init` to create one.');
    }
    const chamferDir = path.dirname(tokensPath);
    const server = new StudioServer({
      port: options.port,
      configPath: tokensPath,
      versionsDir: path.resolve(chamferDir, "_versions")
    });
    server.listen();
  }
});
