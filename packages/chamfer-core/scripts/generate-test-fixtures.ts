import path from "node:path";
import { fileURLToPath } from "node:url";

import { Chamfer } from "../src/Chamfer.js";
import definition from "../src/__tests__/fixtures/.chamfer/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cwd = path.resolve(__dirname, "../src/__tests__/fixtures");

const chamfer = new Chamfer({ logLevel: "warn", env: "development", definition, cwd });
await chamfer.build();
