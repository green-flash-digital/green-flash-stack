import { type RouteObject, createStaticHandler } from "react-router";

import { type RenderToPipeableStreamOptions, renderToPipeableStream } from "react-dom/server";

import { createRouterFromRoutes } from "./createRouterFromRoutes.js";
import type { DocumintServerContext } from "./DocumintServer.js";
import { DocumintServer } from "./DocumintServer.js";
import { LOG_SERVER } from "./server.utils.js";

export function createDocumintRenderToPipeableStream(routes: RouteObject[]) {
  const handler = createStaticHandler(routes);

  return async function render(
    request: Request,
    butteryContext: DocumintServerContext,
    options: RenderToPipeableStreamOptions
  ) {
    const router = await createRouterFromRoutes(handler, request);

    LOG_SERVER.debug("Rendering app to pipeable stream");
    return renderToPipeableStream(<DocumintServer {...butteryContext} {...router} />, options);
  };
}
