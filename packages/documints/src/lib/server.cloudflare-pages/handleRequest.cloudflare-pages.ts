import { ButteryMeta } from "@buttery/meta";
import type { EventPluginContext } from "@cloudflare/workers-types";
import type { Manifest as ViteManifest } from "vite";

import type { ButteryDocsRouteManifest } from "../../utils/util.types.js";
import type { ButteryDocsServerContext } from "../server/ButteryDocsServer.js";
import type { createButteryDocsRenderToReadableStream } from "../server/createRenderFnReadableStream.js";
import { generateHTMLTemplate } from "../server/generateHTMLTemplate.js";
import { getButteryRouteIdFromRequest } from "../server/getButteryRouteFromRequest.js";
import { getRouteAssets } from "../server/getRouteAssets.js";

export type CFContext = EventPluginContext<
  unknown,
  never,
  Record<string, unknown>,
  unknown
>;

export async function handleRequestCloudflarePages(
  render: ReturnType<typeof createButteryDocsRenderToReadableStream>,
  {
    cfContext,
    vManifest,
    bManifest,
  }: {
    cfContext: CFContext;
    vManifest: ViteManifest;
    bManifest: ButteryDocsRouteManifest;
  }
) {
  // Get the route name that we're attempting to request
  const { pathname } = new URL(cfContext.request.url);

  // Get only the route paths
  const routes = Object.values(bManifest).map(
    (manifestEntry) => manifestEntry.routePath
  );

  // if the pathname is a route, then let's render the app
  if (routes.includes(pathname)) {
    try {
      // match the buttery route with the request.pathname
      const routeId = getButteryRouteIdFromRequest(pathname, bManifest);

      // get the css and js assets from the vite manifest
      const { cssAssets, jsAssets } = getRouteAssets(routeId, vManifest);

      // Instantiate a new Meta class to collect the meta tags for each page
      const Meta = new ButteryMeta();

      // Insert the assets into the HTML template start and end
      const { htmlStart, htmlEnd } = generateHTMLTemplate({
        cssLinks: cssAssets,
        jsScripts: jsAssets,
        Meta,
      });

      const responseStatusCode = 200;
      const responseHeaders = new Headers();
      const encoder = new TextEncoder();

      // Generate the stream using the `render` function from the server bundle
      const context: ButteryDocsServerContext = { route: pathname, Meta };
      const streamBody = await render(
        // @ts-expect-error this is the true request but just adds a little extra values to it
        cfContext.request,
        context,
        responseStatusCode
      );

      // Return the stream body if it is a response
      if (streamBody instanceof Response) {
        return streamBody;
      }

      // Insert the app body into the HTML shell
      const stream = new ReadableStream({
        async start(controller) {
          // 1. Send the head and opening body tags
          controller.enqueue(encoder.encode(htmlStart));

          // 2. Pipe the SSR stream into the response
          const reader = streamBody.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value); // Send each chunk of React's stream
          }

          // 3. End with the closing body and html tags
          controller.enqueue(encoder.encode(htmlEnd));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: responseHeaders,
        status: responseStatusCode,
      });
    } catch (error) {
      console.error("Error during SSR:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  try {
    const asset = await cfContext.env.ASSETS.fetch(cfContext.request);
    return asset;
  } catch (error) {
    console.error(`Error serving static file: ${pathname}`, error);
    return new Response("Not Found", { status: 404 });
  }
}
