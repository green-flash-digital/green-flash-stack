import path from "node:path";
import { fileURLToPath } from "node:url";

import definition from "../src/__tests__/.chamfer/config.js";
import { Chamfer } from "../src/Chamfer.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cwd = path.resolve(__dirname, "../src/__tests__");

const chamfer = new Chamfer({ logLevel: "warn", env: "development", definition, cwd });
await chamfer.build();
