import { readFileSync } from "node:fs";

import matter from "gray-matter";


import { LOG } from "../utils/util.logger.js";

type ButterDocsDocumentConfig = {
  title?: string;
  config?: {
    navBarDisplay?: string;
  };
};

export function getDocumentConfigFromFrontmatter(
  routeId: string,
  filepath: string
): Required<ButterDocsDocumentConfig> {
  try {
    LOG.debug(`Parsing file frontmatter: "${filepath}"`);
    const fileContent = readFileSync(filepath, { encoding: "utf8" });
    const { data } = matter(fileContent) as { data: ButterDocsDocumentConfig };
    return {
      title: data.title ?? "",
      config: {
        navBarDisplay: data.config?.navBarDisplay ?? data.title,
      },
    };
  } catch (error) {
    throw LOG.fatal(
      new Error(
        `Error when trying to parse the frontmatter for "${routeId}": ${error}`
      )
    );
  }
}
