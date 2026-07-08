import type { ZodObject, ZodRawShape, ZodTypeAny } from "zod";
import { z } from "zod";

export function optionalSchema<T extends ZodTypeAny>(schema: T, defaultValue: z.infer<T>) {
  return z.preprocess((value) => (value === undefined ? defaultValue : value), schema.optional());
}

export function withDescription<T extends ZodRawShape>(schema: ZodObject<T>) {
  return z
    .object({
      description: z
        .string()
        .optional()
        .describe(
          "A short description explaining rationale for the choices or how they should be used"
        )
    })
    .merge(schema);
}
