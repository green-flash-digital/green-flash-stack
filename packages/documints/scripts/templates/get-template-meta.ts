import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { tryHandle } from "@buttery/utils/isomorphic";

import { fetchGitLabRepoBlob } from "./fetch-gitlab-repo-blob.js";
import type { GitLabRepoTreeNode } from "./types.js";
import { decodeBlobContent } from "./util.decodeBlobContent.js";

import type { TemplateMeta } from "../../src/cli-scripts/add.js";

export async function getTemplateMeta(
  repoName: string,
  repoNodes: GitLabRepoTreeNode[]
): Promise<{ [templatePath: string]: TemplateMeta }> {
  const readme = repoNodes.reduce<GitLabRepoTreeNode | undefined>(
    (accum, node) => {
      if (node.type === "blob" && node.name === "README.md") {
        return node;
      }
      return accum;
    },
    undefined
  );
  if (!readme) {
    throw "Cannot find the README.md when trying to get the descriptions of each of the good docs content types.";
  }

  const readmeBlob = await tryHandle(fetchGitLabRepoBlob)(repoName, readme.id);
  if (readmeBlob.hasError) {
    throw readmeBlob.error;
  }

  // decode the blob content into mixed markdown
  const readmeContent = decodeBlobContent(readmeBlob.data.content);

  // parse the mixed markdown
  const tree = unified()
    .use(remarkParse) // Parse Markdown
    .use(remarkGfm) // Support tables in Markdown
    .use(rehypeParse, { fragment: true }) // Parse HTML fragments
    .use(rehypeRemark) // Convert HTML to Markdown tree
    .parse(readmeContent);

  const templateMeta = new Map<string, TemplateMeta>();

  // Traverse tree to extract Markdown and HTML tables
  visit(tree, (node) => {
    if (node.type === "element" && node.tagName === "table") {
      for (const tableNode of node.children) {
        if (tableNode.type !== "element") continue;
        if (tableNode.tagName === "tbody") {
          for (const tbodyNode of tableNode.children) {
            if (tbodyNode.type !== "element") continue;
            if (tbodyNode.tagName === "tr") {
              const trNode = tbodyNode;

              let path = "";
              let name = "";
              let description = "";

              for (const trChildNode of trNode.children) {
                if (
                  trChildNode.type !== "element" ||
                  trChildNode.tagName !== "td"
                ) {
                  continue;
                }
                const tdNode = trChildNode;

                for (const tdChildNode of tdNode.children) {
                  // get path and name
                  if (
                    tdChildNode.type === "element" &&
                    tdChildNode.tagName === "a"
                  ) {
                    path = tdChildNode.properties.href as string;

                    // anchor node -> text node -> name
                    const tdAnchorNodeText = tdChildNode.children[0];
                    if (tdAnchorNodeText.type === "text") {
                      name = tdAnchorNodeText.value;
                    }
                  }

                  // if we didn't get path, then we know it's not a template link
                  if (path !== "" && tdChildNode.type === "text") {
                    description = tdChildNode.value;
                  }
                }

                templateMeta.set(path, { name, description });
              }
            }
          }
        }
      }
    }
  });

  return Object.fromEntries(templateMeta.entries());
}
