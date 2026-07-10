import type { Plugin } from "vite";
import { z } from "zod";

const butteryDocsConfigHeaderLinkTypeTextSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  href: z.string()
});
export type ButteryDocsConfigHeaderLinkTypeText = z.infer<
  typeof butteryDocsConfigHeaderLinkTypeTextSchema
>;

const butteryDocsConfigHeaderLinkTypeSocialSchema = z.object({
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
export type ButteryDocsConfigHeaderLinkTypeSocial = z.infer<
  typeof butteryDocsConfigHeaderLinkTypeSocialSchema
>;

const butteryDocsConfigHeaderLinkTypeInternalSchema = z.object({
  type: z.literal("internal"),
  text: z.string(),
  href: z.string()
});
export type ButteryDocsConfigHeaderLinkTypeInternal = z.infer<
  typeof butteryDocsConfigHeaderLinkTypeInternalSchema
>;

const butteryDocsConfigHeaderLinkTypeDropdownSchema = z.object({
  type: z.literal("dropdown"),
  text: z.string(),
  items: butteryDocsConfigHeaderLinkTypeInternalSchema
    .omit({ type: true })
    .extend({
      subText: z.string().optional(),
      iconSrc: z.string(),
      iconAlt: z.string()
    })
    .array()
});
export type ButteryDocsConfigHeaderLinkTypeDropdown = z.infer<
  typeof butteryDocsConfigHeaderLinkTypeDropdownSchema
>;

const butteryDocsConfigHeaderLinkSchema = z.discriminatedUnion("type", [
  butteryDocsConfigHeaderLinkTypeTextSchema,
  butteryDocsConfigHeaderLinkTypeSocialSchema,
  butteryDocsConfigHeaderLinkTypeInternalSchema,
  butteryDocsConfigHeaderLinkTypeDropdownSchema
]);
export type ButteryDocsConfigHeaderLink = z.infer<typeof butteryDocsConfigHeaderLinkSchema>;

const butteryDocsConfigHeaderLinksSchema = butteryDocsConfigHeaderLinkSchema.array();

const butteryDocsConfigHeaderSchema = z.object({
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
  links: butteryDocsConfigHeaderLinksSchema.array().optional()
});
export type ButteryDocsConfigHeader = z.infer<typeof butteryDocsConfigHeaderSchema>;

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
  header: butteryDocsConfigHeaderSchema.optional()
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
