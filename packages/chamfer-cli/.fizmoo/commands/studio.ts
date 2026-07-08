import path from "node:path";

import { findKeystoneTokensFile } from "@keystone-css/core";
import { StudioServer } from "@keystone-css/studio/server";
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
    const tokensPath = await findKeystoneTokensFile(process.cwd());
    if (!tokensPath) {
      throw new Error(
        'Could not locate ".keystone/tokens.json". Run `keystone init` to create one.'
      );
    }
    const keystoneDir = path.dirname(tokensPath);
    const server = new StudioServer({
      port: options.port,
      configPath: tokensPath,
      versionsDir: path.resolve(keystoneDir, "_versions")
    });
    server.listen();
  }
});
