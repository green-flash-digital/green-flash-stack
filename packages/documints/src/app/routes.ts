import { createDocumintRoutes } from "./App.js";
import { buildYear, header } from "virtual:data";
import { routeDocs, routeGraph, routeIndex } from "virtual:routes";

export const routes = createDocumintRoutes({
  header,
  buildYear,
  routeGraph,
  routeDocs,
  routeIndex
});
