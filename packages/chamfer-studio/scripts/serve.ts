import path from "node:path";

import { StudioServer } from "../server/StudioServer.js";

const server = new StudioServer({
  configPath: path.resolve(import.meta.dirname, "../.chamfer/tokens.json"),
  versionsDir: path.resolve(import.meta.dirname, "../.chamfer/versions")
});
server.listen();
