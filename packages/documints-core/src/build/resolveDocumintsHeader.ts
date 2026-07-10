import type {
  DocumintConfigHeader,
  DocumintResolvedHeader,
  DocumintResolvedHeaderLink
} from "../config/_config.utils.js";
import { slugify } from "../utils/util.slugify.js";
import type { DocumintRouteManifestGraphObject } from "../utils/util.types.js";

/**
 * Resolves any `{ type: "section", title }` header links against the route
 * graph into a fully-populated `dropdown` link, whose items are that
 * section's child pages. The client only ever sees the resolved shape - it
 * has no notion of doc structure, so `section` never reaches the bundle.
 */
export function resolveDocumintsHeader(
  header: DocumintConfigHeader | undefined,
  routeGraph: DocumintRouteManifestGraphObject
): DocumintResolvedHeader | undefined {
  if (!header) return undefined;
  if (!header.links) return { ...header, links: undefined };

  const links = header.links.map((linkSection) =>
    linkSection.map((link): DocumintResolvedHeaderLink => {
      if (link.type !== "section") return link;

      const sectionKey = slugify(link.title);
      const sectionNode = routeGraph[sectionKey];
      if (!sectionNode) {
        throw new Error(
          `Header link references section "${link.title}", but no top-level doc section resolves to "/${sectionKey}". Check the "title" of that section's index page.`
        );
      }

      return {
        type: "dropdown",
        text: link.title,
        items: Object.values(sectionNode.pages).map((page) => ({
          href: page.routePath,
          text: page.fileNameFormatted
        }))
      };
    })
  );

  return { ...header, links };
}
