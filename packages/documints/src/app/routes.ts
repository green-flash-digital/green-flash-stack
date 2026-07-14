import { createDocumintRoutes } from "./App.js";
import { header } from "virtual:data";
import { routeDocs, routeGraph, routeIndex } from "virtual:routes";

export const routes = createDocumintRoutes({
  header,
  routeGraph,
  routeDocs,
  routeIndex
});
