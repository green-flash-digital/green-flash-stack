import { type StaticHandler, createStaticRouter } from "react-router";

import { LOG_SERVER } from "./server.utils.js";

export async function createRouterFromRoutes(
  { query, dataRoutes }: StaticHandler,
  request: Request
) {
  try {
    // 1. run actions/loaders to get the routing context with `query`
    LOG_SERVER.debug("Creating routing context...");
    const routerContext = await query(request);
    LOG_SERVER.debug("Creating routing context... done.");

    // If `query` returns a Response, send it raw (a route probably a redirected)
    if (routerContext instanceof Response) {
      throw "Unable to process a router context of type Response.";
    }

    // 2. Create a static router for SSR
    LOG_SERVER.debug("Creating static router...");
    const router = createStaticRouter(dataRoutes, routerContext);
    LOG_SERVER.debug("Creating static router... done.");

    return { router, routerContext };
  } catch (error) {
    throw LOG_SERVER.fatal(
      new Error(`Error when trying to create the router: ${error}`)
    );
  }
}
