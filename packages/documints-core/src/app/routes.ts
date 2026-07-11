import "@documints/core/css";
import { createDocumintRoutes } from "@documints/core/app";
import { header } from "virtual:data";
import { routeDocs, routeGraph, routeIndex } from "virtual:routes";

export const routes = createDocumintRoutes({
  header,
  routeGraph,
  routeDocs,
  routeIndex
});
