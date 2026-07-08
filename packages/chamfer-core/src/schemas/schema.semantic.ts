import { z } from "zod";

export const SemanticEntrySchema = z.object({
  light: z.string(),
  dark: z.string()
});
export type ChamferSemanticEntry = z.infer<typeof SemanticEntrySchema>;

export const SemanticSchema = z.record(z.string(), SemanticEntrySchema).default({});
export type ChamferSemantic = z.infer<typeof SemanticSchema>;
