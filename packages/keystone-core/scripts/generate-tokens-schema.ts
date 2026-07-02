import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { zodToJsonSchema } from "zod-to-json-schema";

import { TokensSchema } from "../src/schemas/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.resolve(__dirname, "../src/schemas/tokens.schema.json");

const zodSchema = zodToJsonSchema(TokensSchema, {
  $refStrategy: "none",
  target: "jsonSchema7"
}) as { properties?: Record<string, unknown>; [key: string]: unknown };

const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://schemas.greenflash.digital/keystone-tokens.json",
  title: "KeystoneTokens",
  description:
    "Design token data for a keystone-css design system — stored in tokens.json and imported by config.ts.",
  ...zodSchema,
  properties: {
    $schema: { type: "string" },
    ...zodSchema.properties,
  },
};

fs.writeFileSync(outPath, JSON.stringify(schema, null, 2) + "\n");
console.log(`✓ Generated ${path.relative(path.resolve(__dirname, ".."), outPath)}`);
