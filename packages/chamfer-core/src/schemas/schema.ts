import { z } from "zod";

import { ColorSchema } from "./schema.color.js";
import { CustomSchema } from "./schema.custom.js";
import { FontSchema } from "./schema.font.js";
import { ResponseSchema } from "./schema.response.js";
import { RuntimeSchema } from "./schema.runtime.js";
import { SemanticSchema } from "./schema.semantic.js";
import { SizeAndSpaceSchema } from "./schema.size-and-space.js";

export const ConfigSchema = z.object({
  runtime: RuntimeSchema,
  sizeAndSpace: SizeAndSpaceSchema,
  font: FontSchema,
  response: ResponseSchema,
  color: ColorSchema,
  semantic: SemanticSchema,
  custom: CustomSchema
});
export type ChamferConfig = z.infer<typeof ConfigSchema>;

// TokensSchema is the studio-managed data layer — the same shape as ConfigSchema.
// Stored in tokens.json and imported by config.ts. Kept as a named alias so
// callers can reference the semantic intent without a breaking rename.
export const TokensSchema = ConfigSchema;
export type ChamferTokens = ChamferConfig;
