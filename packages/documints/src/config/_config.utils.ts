import type { Plugin } from "vite";
import { z } from "zod";

const butteryDocsConfigHeaderLinkTypeTextSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  href: z.string(),
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
  label: z.string(),
});
export type ButteryDocsConfigHeaderLinkTypeSocial = z.infer<
  typeof butteryDocsConfigHeaderLinkTypeSocialSchema
>;

const butteryDocsConfigHeaderLinkTypeInternalSchema = z.object({
  type: z.literal("internal"),
  text: z.string(),
  href: z.string(),
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
      iconAlt: z.string(),
    })
    .array(),
});
export type ButteryDocsConfigHeaderLinkTypeDropdown = z.infer<
  typeof butteryDocsConfigHeaderLinkTypeDropdownSchema
>;

const butteryDocsConfigHeaderLinkSchema = z.discriminatedUnion("type", [
  butteryDocsConfigHeaderLinkTypeTextSchema,
  butteryDocsConfigHeaderLinkTypeSocialSchema,
  butteryDocsConfigHeaderLinkTypeInternalSchema,
  butteryDocsConfigHeaderLinkTypeDropdownSchema,
]);
export type ButteryDocsConfigHeaderLink = z.infer<
  typeof butteryDocsConfigHeaderLinkSchema
>;

const butteryDocsConfigHeaderLinksSchema =
  butteryDocsConfigHeaderLinkSchema.array();

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
      alt: z.string(),
    })
    .optional(),
  /**
   * Links that will appear in order from left to right that link
   * out to different external pages or to places inside of the
   * documents app
   */
  links: butteryDocsConfigHeaderLinksSchema.array().optional(),
});
export type ButteryDocsConfigHeader = z.infer<
  typeof butteryDocsConfigHeaderSchema
>;

export const butteryDocsConfigSchema = z.object({
  buildTarget: z.union([z.literal("cloudflare-pages"), z.literal("basic")]),
  /**
   * An optional key to further configure the routing
   * of your docs application.
   */
  routing: z
    .object({
      /**
       * Optionally add extra absolute paths to create pages with directories
       * that are outside the local .buttery/docs folder. This is helpful
       * when you have a mono-repo of multiple packages and want to co-locate
       * their docs in their package, but only want to publish one buttery-docs site.
       *
       * The directories that are defined here will create new pages entries.
       * - `routeName` is the name of the route that you wish to create. This will be the route that others will access this directory of docs at.
       * - `path` is the absolute path where the docs are. Most often, this is in another .buttery/docs folder but it can be elsewhere
       */
      pageDirectories: z
        .object({ routeName: z.string(), path: z.string() })
        .array(),
    })
    .optional(),
  order: z.record(z.string(), z.string().array()).optional(),
  header: butteryDocsConfigHeaderSchema.optional(),
});

export type ButteryDocsConfig = z.infer<typeof butteryDocsConfigSchema> & {
  vitePlugins?:
    | ((params: {
        /**
         * The directory that the .buttery/ directory resides in, typically the
         * root of the package or repository
         */
        rootDir: string;
      }) => Plugin[])
    | Plugin[];
};
