import { readFileSync } from "node:fs";

import matter from "gray-matter";

import { LOG } from "../utils/util.logger.js";

export type DocumintsFrontmatter = {
  /**
   * A slash-delimited hierarchy path, e.g. "Guides/Deployment". Each segment
   * becomes a nested section in the nav, and the last segment is both the
   * page's display title and (slugified) its URL segment.
   */
  title: string;
  /**
   * Overrides the auto-slugified last segment of the URL without changing
   * the displayed title, e.g. title "Guides/Deployment" + slug "deploy"
   * routes to "/guides/deploy" but still displays as "Deployment".
   */
  slug?: string;
  /**
   * Marks this doc as the site's home page, served at "/". Its `title` is
   * still used for display purposes, but it's excluded from the nav tree.
   */
  home?: boolean;
};

export function getDocumentConfigFromFrontmatter(
  routeId: string,
  filepath: string
): DocumintsFrontmatter {
  try {
    LOG.debug(`Parsing file frontmatter: "${filepath}"`);
    const fileContent = readFileSync(filepath, { encoding: "utf8" });
    const { data } = matter(fileContent) as { data: Partial<DocumintsFrontmatter> };

    if (!data.title) {
      throw new Error(
        'Missing required "title" frontmatter field. Every .doc file needs a "title" ' +
          '(e.g. "Guides/Deployment") that determines its place in the navigation hierarchy.'
      );
    }

    return {
      title: data.title,
      slug: data.slug,
      home: data.home ?? false,
    };
  } catch (error) {
    throw LOG.fatal(
      new Error(
        `Error when trying to parse the frontmatter for "${routeId}": ${error}`
      )
    );
  }
}
