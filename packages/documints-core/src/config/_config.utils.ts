import type { Plugin } from "vite";
import { z } from "zod";

const DocumintConfigHeaderLinkTypeTextSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  href: z.string()
});
export type DocumintConfigHeaderLinkTypeText = z.infer<
  typeof DocumintConfigHeaderLinkTypeTextSchema
>;

const DocumintConfigHeaderLinkTypeSocialSchema = z.object({
  type: z.literal("social"),
  provider: z.union([z.literal("github"), z.literal("discord")]),
  href: z.string(),
  /**
   * Since these types of links only display icons, we need to ensure
   * that we provide a label that is accompanies the icon in order to ensure
   * that our links are 100% accessible.
   */
  label: z.string()
});
export type DocumintConfigHeaderLinkTypeSocial = z.infer<
  typeof DocumintConfigHeaderLinkTypeSocialSchema
>;

const DocumintConfigHeaderLinkTypeInternalSchema = z.object({
  type: z.literal("internal"),
  text: z.string(),
  href: z.string()
});
export type DocumintConfigHeaderLinkTypeInternal = z.infer<
  typeof DocumintConfigHeaderLinkTypeInternalSchema
>;

const DocumintConfigHeaderLinkTypeDropdownSchema = z.object({
  type: z.literal("dropdown"),
  text: z.string(),
  items: DocumintConfigHeaderLinkTypeInternalSchema.omit({ type: true })
    .extend({
      subText: z.string().optional(),
      iconSrc: z.string().optional(),
      iconAlt: z.string().optional()
    })
    .array()
});
export type DocumintConfigHeaderLinkTypeDropdown = z.infer<
  typeof DocumintConfigHeaderLinkTypeDropdownSchema
>;

const DocumintConfigHeaderLinkTypeSectionSchema = z.object({
  type: z.literal("section"),
  /**
   * The `title` of a top-level doc section's index page (e.g. "Guides"),
   * matched by slug. Resolved at build/dev time into a `dropdown` link whose
   * items are that section's child pages - the client never sees this type,
   * only the fully-resolved result.
   */
  title: z.string()
});
export type DocumintConfigHeaderLinkTypeSection = z.infer<
  typeof DocumintConfigHeaderLinkTypeSectionSchema
>;

const DocumintConfigHeaderLinkSchema = z.discriminatedUnion("type", [
  DocumintConfigHeaderLinkTypeTextSchema,
  DocumintConfigHeaderLinkTypeSocialSchema,
  DocumintConfigHeaderLinkTypeInternalSchema,
  DocumintConfigHeaderLinkTypeDropdownSchema,
  DocumintConfigHeaderLinkTypeSectionSchema
]);
export type DocumintConfigHeaderLink = z.infer<typeof DocumintConfigHeaderLinkSchema>;

const DocumintConfigHeaderLinksSchema = DocumintConfigHeaderLinkSchema.array();

const DocumintConfigHeaderSchema = z.object({
  /**
   * Adds a title in the upper left hand of the application
   */
  title: z.string().optional(),
  /**
   * Adds a logo that is at a particular URL to be displayed in the top
   * left hand corner of the docs app
   */
  logo: z
    .object({
      src: z.string(),
      alt: z.string()
    })
    .optional(),
  /**
   * Links that will appear in order from left to right that link
   * out to different external pages or to places inside of the
   * documents app
   */
  links: DocumintConfigHeaderLinksSchema.array().optional()
});
export type DocumintConfigHeader = z.infer<typeof DocumintConfigHeaderSchema>;

/**
 * The shape of a header link once `section` links have been resolved against
 * the route graph (see `resolveDocumintsHeader.ts`) - this is what's actually
 * serialized to the client, so it never needs to know about `section` links.
 */
export type DocumintResolvedHeaderLink = Exclude<
  DocumintConfigHeaderLink,
  DocumintConfigHeaderLinkTypeSection
>;
export type DocumintResolvedHeader = Omit<DocumintConfigHeader, "links"> & {
  links?: DocumintResolvedHeaderLink[][];
};

export const documintsConfigSchema = z.object({
  /**
   * A glob pattern for finding your `.doc.md`/`.doc.mdx` files, resolved
   * relative to the `.documints/` directory. Defaults to
   * `"./content/**\/*.doc.{md,mdx}"` - override this if you'd rather keep
   * your docs somewhere else, e.g. a `content/` folder at your project root:
   * `"../content/**\/*.doc.md"`.
   */
  docs: z.string().optional(),
  order: z.record(z.string(), z.string().array()).optional(),
  header: DocumintConfigHeaderSchema.optional()
});

export type DocumintsConfig = z.infer<typeof documintsConfigSchema> & {
  vitePlugins?:
    | ((params: {
        /**
         * The directory that the .documints/ directory resides in, typically
         * the root of the package or repository
         */
        rootDir: string;
      }) => Plugin[])
    | Plugin[];
};
