import {
  type ReactDOMServerReadableStream,
  renderToReadableStream,
} from "react-dom/server";
import { type RouteObject, createStaticHandler } from "react-router";

import {
  ButteryDocsServer,
  type ButteryDocsServerContext,
} from "./ButteryDocsServer.js";
import { createRouterFromRoutes } from "./createRouterFromRoutes.js";
import { LOG_SERVER } from "./server.utils.js";

const ABORT_DELAY = 5_000;

export function createButteryDocsRenderToReadableStream(routes: RouteObject[]) {
  const routeHandler = createStaticHandler(routes);

  return async function render(
    request: Request,
    butteryContext: ButteryDocsServerContext,
    responseStatusCode: number
  ) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ABORT_DELAY);

    const router = await createRouterFromRoutes(routeHandler, request);

    // Render the app to a ReadableStream using React's server renderer
    LOG_SERVER.debug("Rendering app to readable stream");
    const stream = (await renderToReadableStream(
      <ButteryDocsServer {...butteryContext} {...router} />,
      // TODO: Move this into the implementation of the stream
      {
        signal: controller.signal,
        onError(error: unknown) {
          if (!controller.signal.aborted) {
            // Log streaming rendering errors from inside the shell
            console.error(error, responseStatusCode);
          }
          responseStatusCode = 500;
        },
      }
    )) as ReactDOMServerReadableStream;

    stream.allReady.then(() => clearTimeout(timeoutId));

    // regardless of streaming, we're going to wait on everything since it's just
    // a documentation site. We don't need to over engineer this... yanno?
    await stream.allReady;

    return stream;
  };
}
