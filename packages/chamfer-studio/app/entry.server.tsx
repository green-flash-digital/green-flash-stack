import type { EntryContext, RouterContextProvider } from "react-router";
import { ServerRouter } from "react-router";

import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";

// react-dom/server resolves to a DIFFERENT build per platform (Node vs. Web
// Streams), each exposing a different, non-overlapping export
// (renderToPipeableStream vs. renderToReadableStream) — a single static import
// pulling both from the same specifier fails to resolve under whichever
// environment's Vite instance doesn't provide that export. Each branch below
// dynamically imports only the one it needs, resolved lazily against that
// branch's own active environment.

// Same STUDIO_IS_LOCAL convention used elsewhere (react-router.config.ts,
// vite.config.local.ts) — scripts/dev.ts sets it before starting the local
// Express server; it's unset (falsy) in the deployed Cloudflare Worker.
const isLocal = process.env.STUDIO_IS_LOCAL === "true";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: RouterContextProvider
) {
  return isLocal
    ? handleNodeRequest(request, responseStatusCode, responseHeaders, routerContext)
    : handleWorkerRequest(request, responseStatusCode, responseHeaders, routerContext);
}

// Node (local CLI, Express) — react-router's own default entry.server.node.tsx,
// using renderToPipeableStream. Not available in the Workers runtime.
async function handleNodeRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
) {
  // https://httpwg.org/specs/rfc9110.html#HEAD
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, { status: responseStatusCode, headers: responseHeaders });
  }

  const [{ PassThrough }, { createReadableStreamFromReadable }, { renderToPipeableStream }] =
    await Promise.all([
      import("node:stream"),
      import("@react-router/node"),
      import("react-dom/server")
    ]);

  return new Promise<Response>((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get("user-agent");

    const readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";

    const { pipe } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");
          pipe(body);

          resolve(new Response(stream, { headers: responseHeaders, status: responseStatusCode }));
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell. Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged above.
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}

// Workers (deployed SaaS) — the Cloudflare template's entry, using
// renderToReadableStream (Web Streams API — the only option in workerd).
async function handleWorkerRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext
) {
  const { renderToReadableStream } = await import("react-dom/server");

  let shellRendered = false;
  const userAgent = request.headers.get("user-agent");

  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      onError(error: unknown) {
        responseStatusCode = 500;
        if (shellRendered) {
          console.error(error);
        }
      }
    }
  );
  shellRendered = true;

  if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, { headers: responseHeaders, status: responseStatusCode });
}
