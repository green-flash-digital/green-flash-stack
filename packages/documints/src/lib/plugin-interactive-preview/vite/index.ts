import fs from "node:fs";
import path from "node:path";

import { exhaustiveMatchGuard } from "@buttery/utils/isomorphic";
import type { Plugin } from "vite";

type VitePluginButteryDocsInteractivePreviewOptions = {
  componentRootDir: string;
};

const previewRegex = /{\/\*\s*preview:\s*([^*]+)\s*\*\/}/g;

// Define the structure of the parsed preview data
type PreviewData =
  | {
      type: "interactive";
      path: string;
      export: string;
    }
  | {
      type: "fence";
      path: string;
      export: string;
      lang: string;
    };

// Function to parse a single preview comment
function parsePreviewComment(commentString: string): PreviewData {
  const data = commentString
    .split(";")
    .map((pair) => pair.split("=").map((str) => str.trim()))
    .reduce<PreviewData>((accum, [key, value]) => {
      return Object.assign(accum, { [key]: value.replace(/['"]/g, "") });
    }, {} as PreviewData);
  return data;
}

/**
 * Inline's a component preview and it's code within a code comment block
 * in any MDX document file relative to the options.componentRootDir
 */
export function vitePluginButteryDocsInteractivePreview(
  options: VitePluginButteryDocsInteractivePreviewOptions
): Plugin {
  return {
    enforce: "pre",
    name: "buttery-tools-mdx-transform-code",
    transform(code: string, id: string) {
      if (!id.endsWith(".mdx")) return;

      /**
       * Adjusted exampleRegex to capture everything after example:
       */
      let matchNum = 0;
      const transformedCode = code.replace(previewRegex, (_, rawParams) => {
        const params = parsePreviewComment(rawParams);

        // validate that the key values exist
        for (const [key, value] of Object.entries(params)) {
          if (!value) {
            throw `Missing value for "${key}" in the preview comment "${rawParams}"`;
          }
        }

        const transformedPath = path.join(
          options.componentRootDir,
          params.path
        );
        const codeBlock = fs.readFileSync(transformedPath, {
          encoding: "utf8",
        });

        matchNum++;

        // render a different treatment based upon the type of the parsed params
        switch (params.type) {
          case "interactive":
            return `

import { InteractivePreview as InteractivePreviewComponent${matchNum} } from "@buttery/docs/plugin-interactive-preview/ui";
import { ${params.export} as Component${matchNum} } from "${transformedPath}";

<InteractivePreviewComponent${matchNum}>
  <Component${matchNum} />
  \`\`\`tsx
  ${codeBlock}
  \`\`\`
</InteractivePreviewComponent${matchNum}>

`;

          case "fence":
            return `
\`\`\`${params.lang}
  ${codeBlock}
  \`\`\`
`;
          default:
            return exhaustiveMatchGuard(params);
        }
      });

      return {
        code: transformedCode,
        map: null, // Provide source map if necessary
      };
    },
  };
}
