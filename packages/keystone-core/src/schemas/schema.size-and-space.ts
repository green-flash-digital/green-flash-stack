import { z } from "zod";

import { withDescription } from "./schema-utils.js";

export const SpaceVariantSchema = z.record(z.string(), z.number());

export const SpaceManualSchema = z.object({
  mode: z.literal("manual"),
  variants: z.number().array()
});
export type SpaceManual = z.infer<typeof SpaceManualSchema>;

export const SpaceAutoSchema = z.object({
  mode: z.literal("auto"),
  variants: z.number().default(11)
});
export type SpaceAuto = z.infer<typeof SpaceAutoSchema>;

export const SizeAndSpaceSchema = withDescription(
  z.object({
    baseFontSize: z.number().default(16),
    /**
     * ## Description
     * The integer that will regulate the visual harmony of the application by enforcing strict spacing requirements
     *
     * ## Overview
     * The point grid system is a framework that helps you place and arrange elements in your design with precision.
     * The general premise is that whenever you create space between elements, it should be divisible by four (4, 8, 12, 16, etc.).
     *
     * One of the most noticeable advantages of the 4-point grid system is that it acts as compass to enhance visual hierarchy and organization within your design.
     * Following the 4-point grid creates a sense of order and structure. Elements don't just sit on the canvas — they align
     * with purpose and intent by following the grid lines with precision.
     *
     * This draws the user's attention to pivotal points and accentuates the key components for a clean and well-orchestrated visual flow.
     * The result? Designs that not only look appealing but also feel intuitive and fluid to navigate.
     *
     * Setting this value really depends upon the purpose of your application. As a general rule of thumb
     * if you're creating a marketing website, then an `8pt` system might be the way to go since white space,
     * negative space, etc.. is important to make your content easily consumable. If you're building something like
     * Figma, Webflow, a Bloomberg Terminal or any other screen intensive tool, you might want a `4pt` grid system to compress space and manage
     * it a little more granularly.
     *
     * ## Learn More
     * - [Why Webflow uses a 4pt grid system](https://webflow.com/blog/why-were-using-a-4-point-grid-in-webflow)
     * - [The grid point system overview](https://www.thedesignership.com/blog/the-ultimate-spacing-guide-for-ui-designers)
     *
     * @default 4
     */
    baselineGrid: z.number().default(4),
    size: z
      .object({
        variants: z
          .record(z.string(), z.number())
          .describe(
            "Semantically named variants that describe the height of elements that can be placed inline with each other. By default, the values of the key value pairs should be divisible by the baselineGrid factor. This ensures that all mechanisms that use this are the same height so vertical rhythm is preserved using any inline element. Sizes often follow modular scaling systems (e.g., Major Third Scale, where each step is 1.25x the previous size) or the Golden Ratio (1.618x) for harmonious proportions."
          )
      })
      .describe(
        "A key in which to describe the sizing constraints of the keystone-css utility system"
      ),
    space: z.discriminatedUnion("mode", [SpaceManualSchema, SpaceAutoSchema])
  })
).default({
  baseFontSize: 16,
  baselineGrid: 4,
  size: {
    variants: {}
  },
  space: {
    mode: "auto",
    variants: 10
  }
});
export type KeystoneConfigSizeAndSpace = z.infer<typeof SizeAndSpaceSchema>;
