import "documints/css";
import { createButteryDocsRoutes } from "documints/app";
import { header } from "virtual:data";
import { routeDocs, routeGraph, routeIndex } from "virtual:routes";

export const routes = createButteryDocsRoutes({
  header,
  routeGraph,
  routeDocs,
  routeIndex
});
