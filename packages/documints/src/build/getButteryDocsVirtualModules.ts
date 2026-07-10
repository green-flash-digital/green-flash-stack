import { produce } from "immer";

import type { ResolvedDocumintsConfig } from "../Documints.js";
import { LOG } from "../utils/util.logger.js";
import type {
  ButteryDocsRouteManifest,
  ButteryDocsRouteManifestEntry
} from "../utils/util.types.js";
import { getButteryDocsRouteGraph } from "./getButteryDocsRouteGraph.js";
import { resolveDocumintsHeader } from "./resolveDocumintsHeader.js";

export type ButteryDocsVirtualModules = ReturnType<typeof getButteryDocsVirtualModules>;

export function getButteryDocsVirtualModules(
  rConfig: ResolvedDocumintsConfig,
  routeManifest: ButteryDocsRouteManifest
) {
  const routeGraph = getButteryDocsRouteGraph(routeManifest);
  const { routeIndex, routeDocs } = Object.entries(routeManifest).reduce<{
    routeIndex: ButteryDocsRouteManifestEntry | undefined;
    routeDocs: ButteryDocsRouteManifest;
  }>(
    (accum, [routeId, routeManifestEntry]) => {
      if (routeManifestEntry.root) {
        return produce(accum, (draft) => {
          draft.routeIndex = routeManifestEntry;
        });
      }
      return produce(accum, (draft) => {
        draft.routeDocs[routeId] = routeManifestEntry;
      });
    },
    { routeIndex: undefined, routeDocs: {} }
  );

  // Validate that the
  LOG.debug("Validating index file exists...");
  if (typeof routeIndex === "undefined") {
    throw LOG.fatal(
      new Error(
        'Cannot find a home page. Ensure that one of your .doc.md/.doc.mdx files has "home: true" in its frontmatter.'
      )
    );
  }
  LOG.debug("Validating index file exists... done.");

  const routes = `;
export const routeIndex = {
  routePath: "/",
  aliasPath: ${JSON.stringify(routeIndex.aliasPath)},
  fileName: ${JSON.stringify(routeIndex.fileName)},
  fileNameFormatted: ${JSON.stringify(routeIndex.fileNameFormatted)},
  root: "${routeIndex.root}",
  importComponent: async () => await import("@docs${routeIndex.aliasPath}")
};
export const routeGraph = ${JSON.stringify(routeGraph, null, 2)};
export const routeDocs = [${Object.values(routeDocs).map(
    (routeEntry) => `{
  routePath: "${routeEntry.routePath}",
  aliasPath: ${JSON.stringify(routeEntry.aliasPath)},
  fileName: ${JSON.stringify(routeEntry.fileName)},
  fileNameFormatted: ${JSON.stringify(routeEntry.fileNameFormatted)},
  root: "${routeEntry.root}",
  importComponent: async () => await import("@docs${routeEntry.aliasPath}")
}`
  )}];
  `;

  const resolvedHeader = resolveDocumintsHeader(rConfig.config.header, routeGraph);
  const data = `export const header = ${JSON.stringify(resolvedHeader)}`;

  return {
    "virtual:routes": routes,
    "virtual:data": data
  };
}
