import { z } from "zod";

import { ColorSchema } from "./schema.color.js";
import { CustomSchema } from "./schema.custom.js";
import { FontSchema } from "./schema.font.js";
import { ResponseSchema } from "./schema.response.js";
import { RuntimeSchema } from "./schema.runtime.js";
import { SizeAndSpaceSchema } from "./schema.size-and-space.js";

export const ConfigSchema = z.object({
  runtime: RuntimeSchema,
  sizeAndSpace: SizeAndSpaceSchema,
  font: FontSchema,
  response: ResponseSchema,
  color: ColorSchema,
  custom: CustomSchema
});
export type KeystoneConfig = z.infer<typeof ConfigSchema>;
