import "documints/css";
import { header } from "virtual:data";
import { routeDocs, routeGraph, routeIndex } from "virtual:routes";

import { createButteryDocsRoutes } from "documints/app";

export const routes = createButteryDocsRoutes({
  header,
  routeGraph,
  routeDocs,
  routeIndex,
});
