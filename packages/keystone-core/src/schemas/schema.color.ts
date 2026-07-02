import { z } from "zod";

import { withDescription } from "./schema-utils.js";

// ── Shared variant schemas ───────────────────────────────────────────────────

const ColorVariantTypeAutoSchema = z.number();
export type ColorVariantTypeAuto = z.infer<typeof ColorVariantTypeAutoSchema>;

const ColorVariantTypeNamedSchema = z.string().array();
export type ColorVariantTypeNamed = z.infer<typeof ColorVariantTypeNamedSchema>;

const ColorVariantTypeKeyValueSchema = z.record(z.string(), z.string());
export type ColorVariantTypeKeyValue = z.infer<typeof ColorVariantTypeKeyValueSchema>;

export const ColorVariantTypesSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("auto"), variant: ColorVariantTypeAutoSchema }),
  z.object({
    type: z.literal("auto-named"),
    variant: ColorVariantTypeNamedSchema
  }),
  z.object({
    type: z.literal("key-value"),
    variant: ColorVariantTypeKeyValueSchema
  })
]);
export type ColorVariantTypes = z.infer<typeof ColorVariantTypesSchema>;

const ColorVariantBaseSchema = z.union([ColorVariantTypeAutoSchema, ColorVariantTypeNamedSchema]);
const ColorVariantAutoSchema = ColorVariantBaseSchema;
export type KeystoneColorVariantBase = z.infer<typeof ColorVariantAutoSchema>;

const ColorVariantManualSchema = ColorVariantBaseSchema.or(ColorVariantTypeKeyValueSchema);
export type KeystoneColorVariant = z.infer<typeof ColorVariantManualSchema>;

// ── Color def schemas (kept for backward compat with studio utils) ────────────

export const ColorDefHueSchema = z.record(
  z.string(),
  z.object({
    hue: z.number().min(0).max(360),
    variants: ColorVariantAutoSchema
  })
);
export type KeystoneColorDefHue = z.infer<typeof ColorDefHueSchema>;

export const ColorDefHexSchema = z.record(
  z.string(),
  z.object({
    hex: z.string(),
    variants: ColorVariantManualSchema
  })
);
export type KeystoneColorDefHex = z.infer<typeof ColorDefHexSchema>;

// ── Vibe system (oklch perceptual constraints) ───────────────────────────────

export const vibePresets = {
  jewel: { minL: 0.4, maxL: 0.65, minC: 0.14, maxC: 0.22 },
  pastel: { minL: 0.8, maxL: 0.92, minC: 0.04, maxC: 0.1 },
  earth: { minL: 0.4, maxL: 0.65, minC: 0.05, maxC: 0.1 },
  neutral: { minL: 0.5, maxL: 0.9, minC: 0.0, maxC: 0.02 },
  fluorescent: { minL: 0.75, maxL: 0.9, minC: 0.22, maxC: 0.28 }
} as const;
export type VibeName = keyof typeof vibePresets;

function makeVibeTypeSchema<T extends VibeName>(type: T) {
  const p = vibePresets[type];
  return z.object({
    type: z.literal(type),
    lightness: z.number().min(p.minL).max(p.maxL),
    chroma: z.number().min(p.minC).max(p.maxC)
  });
}

export const VibeJewelSchema = makeVibeTypeSchema("jewel");
export const VibePastelSchema = makeVibeTypeSchema("pastel");
export const VibeEarthSchema = makeVibeTypeSchema("earth");
export const VibeNeutralSchema = makeVibeTypeSchema("neutral");
export const VibeFluorescentSchema = makeVibeTypeSchema("fluorescent");

export const VibeSchema = z.discriminatedUnion("type", [
  VibeJewelSchema,
  VibePastelSchema,
  VibeEarthSchema,
  VibeNeutralSchema,
  VibeFluorescentSchema
]);
export type KeystoneColorVibe = z.infer<typeof VibeSchema>;

// ── Unified color entry schemas ──────────────────────────────────────────────

const ColorEntryHueSchema = z.object({
  hue: z.number().min(0).max(360),
  variants: ColorVariantAutoSchema
});
export type KeystoneColorEntryHue = z.infer<typeof ColorEntryHueSchema>;

const ColorEntryHexSchema = z.object({
  hex: z.string(),
  variants: ColorVariantManualSchema.default(0)
});
export type KeystoneColorEntryHex = z.infer<typeof ColorEntryHexSchema>;

export const ColorEntrySchema = z.union([ColorEntryHueSchema, ColorEntryHexSchema]);
export type KeystoneColorEntry = z.infer<typeof ColorEntrySchema>;

// ── Root color schema ────────────────────────────────────────────────────────

export const ColorSchema = withDescription(
  z.object({
    vibe: VibeSchema.optional(),
    colors: z.record(z.string(), ColorEntrySchema).default({})
  })
).default({ colors: {} });
export type KeystoneColor = z.infer<typeof ColorSchema>;
