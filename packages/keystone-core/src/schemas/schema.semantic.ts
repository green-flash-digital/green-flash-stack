import { z } from "zod";

export const SemanticEntrySchema = z.object({
  light: z.string(),
  dark: z.string()
});
export type KeystoneSemanticEntry = z.infer<typeof SemanticEntrySchema>;

export const SemanticSchema = z.record(z.string(), SemanticEntrySchema).default({});
export type KeystoneSemantic = z.infer<typeof SemanticSchema>;
