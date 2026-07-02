import path from "node:path";

import { StudioServer } from "../StudioServer.js";

const server = new StudioServer({
  configPath: path.resolve(import.meta.dirname, "../.keystone/tokens.json"),
  versionsDir: path.resolve(import.meta.dirname, "../.keystone/_versions")
});
server.listen();
