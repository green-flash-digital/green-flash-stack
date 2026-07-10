import { produce } from "immer";

import { getButteryDocsRouteGraph } from "./getButteryDocsRouteGraph.js";

import type { ResolvedButteryDocsConfig } from "../config/getButteryDocsConfig.js";
import { LOG } from "../utils/util.logger.js";
import type {
  ButteryDocsRouteManifest,
  ButteryDocsRouteManifestEntry,
} from "../utils/util.types.js";

export type ButteryDocsVirtualModules = ReturnType<
  typeof getButteryDocsVirtualModules
>;

export function getButteryDocsVirtualModules(
  rConfig: ResolvedButteryDocsConfig,
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
        "Cannot find an '_index' route. Ensure that you have added an _index.(md|mdx) route inside of the '.buttery/docs' directory."
      )
    );
  }
  LOG.debug("Validating index file exists... done.");

  const routes = `;
export const routeIndex = {
  routePath: "/",
  aliasPath: "${routeIndex.aliasPath}",
  root: "${routeIndex.root}",
  importComponent: async () => await import("@docs${routeIndex.aliasPath}")
};
export const routeGraph = ${JSON.stringify(routeGraph, null, 2)};
export const routeDocs = [${Object.values(routeDocs).map(
    (routeEntry) => `{
  routePath: "${routeEntry.routePath}",
  aliasPath: "${routeEntry.aliasPath}",
  root: "${routeEntry.root}",
  importComponent: async () => await import("@docs${routeEntry.aliasPath}")
}`
  )}];
  `;

  const data = `export const header = ${JSON.stringify(rConfig.config.header)}`;

  return {
    "virtual:routes": routes,
    "virtual:data": data,
  };
}
