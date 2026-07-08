import { z } from "zod";

/**
 * ## Description
 * Add custom defined key value pairs of tokens that fall outside
 * of the the parameters of the required token configurations. You can also
 * transform the property at build time to transform the value of the token
 * that is stored in the :root
 *
 * ## Uses Cases
 * Let's say that you have a header and a few other components that are deeply nested in your layout
 * and that you want to make sure that those separate components are sticky relative to the top of the
 * header. If you're using react, you would traditionally pass a ref around or use the DOM document
 * API to get the header height after it renders. This however enables you to easily use
 * the `makeCustom` token to reference that height regardless of where you are in your code.
 *
 * Think of this as a global reference that you can use a pure function to easily interface
 * that variable.
 *
 * @default undefined
 * @example
 * ```json
 * { "layout-header-height": 48 };
 * ```
 */
const CustomVariantSharedSchema = z.object({ description: z.string() });
export const CustomVariantRemSchema = z
  .object({
    type: z.literal("rem"),
    value: z.number()
  })
  .merge(CustomVariantSharedSchema);
export type CustomVariantRem = z.infer<typeof CustomVariantRemSchema>;

export const CustomVariantStringSchema = z
  .object({
    type: z.literal("string"),
    value: z.string()
  })
  .merge(CustomVariantSharedSchema);
export type CustomVariantString = z.infer<typeof CustomVariantStringSchema>;

export const CustomVariantNumberSchema = z
  .object({
    type: z.literal("number"),
    value: z.number()
  })
  .merge(CustomVariantSharedSchema);
export type CustomVariantNumber = z.infer<typeof CustomVariantNumberSchema>;

export const CustomVariantSchema = z.discriminatedUnion("type", [
  CustomVariantRemSchema,
  CustomVariantStringSchema,
  CustomVariantNumberSchema
]);
export type CustomVariant = z.infer<typeof CustomVariantSchema>;

export const CustomSchema = z.record(z.string(), CustomVariantSchema).default({});
export type ChamferConfigCustom = z.infer<typeof CustomSchema>;
