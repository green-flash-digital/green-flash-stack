import "@buttery/docs/css";
import { header } from "virtual:data";
import { routeDocs, routeGraph, routeIndex } from "virtual:routes";

import { createButteryDocsRoutes } from "@buttery/docs/app";

export const routes = createButteryDocsRoutes({
  header,
  routeGraph,
  routeDocs,
  routeIndex,
});
