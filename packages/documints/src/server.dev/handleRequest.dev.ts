import { Transform } from "node:stream";

import type { Request, Response } from "express";
import type { ViteDevServer } from "vite";

import type { DocumintsDirs } from "../Documints.js";
import { DocumintsMeta } from "../meta/DocumintsMeta.js";
import type { createDocumintRenderToPipeableStream } from "../server/createRenderFnPipeableStream.js";
import type { DocumintServerContext } from "../server/DocumintServer.js";
import { expressToWebRequest } from "../server/expressToWebRequest.js";
import { generateHTMLTemplate } from "../server/generateHTMLTemplate.js";
import { LOG_SERVER_DEV } from "./server-dev.utils.js";

const ABORT_DELAY = 10_000;

export async function handleRequestDev(
  render: ReturnType<typeof createDocumintRenderToPipeableStream>,
  config: {
    req: Request;
    res: Response;
    dirs: DocumintsDirs;
    vite: ViteDevServer;
    head?: string;
    markdownHref?: string;
  }
) {
  try {
    // Instantiate a new Meta class to collect the meta tags for each page
    const Meta = new DocumintsMeta();

    // Insert the assets into the HTML template start and end
    LOG_SERVER_DEV.debug("Generating HTML template...");
    const { htmlDev } = generateHTMLTemplate({
      // @wyw-in-js/vite's ssrDevCss option (see Documints.ts's getViteConfig)
      // auto-injects its own versioned <link> to /_wyw-in-js/ssr.css via
      // transformIndexHtml below, covering every css-in-js component style.
      // The plain CSS imports (design tokens, the self-hosted font) need
      // their own real <link>s here for the same reason - both avoid the
      // gap between first paint and Vite's normal JS-side-effect style
      // injection in dev.
      cssLinks: config.dirs.plainCssDevHrefs,
      jsScripts: [config.dirs.appEntryClientPath],
      Meta,
      head: config.head,
      markdownHref: config.markdownHref
    });
    LOG_SERVER_DEV.debug("Generating HTML template... done.");

    // Create the ButteryContext to pass to the render function
    const butteryContext: DocumintServerContext = {
      route: config.req.originalUrl,
      Meta
    };

    let didError = false;

    // allow vite to inject the necessary scripts
    LOG_SERVER_DEV.debug("Injecting scripts into HTML base...");
    const htmlTemplate = await config.vite.transformIndexHtml(config.req.url, htmlDev);
    LOG_SERVER_DEV.debug("Injecting scripts into HTML base... done");

    // Run the render function imported from the entry-server.ts file
    //
    // React can invoke `onAllReady` synchronously, before this `await render(...)`
    // call itself returns (e.g. for a fast, Suspense-free tree like a plain
    // `.doc.tsx` page). Referencing the destructured `pipe`/`abort` from inside
    // these callbacks would then hit their temporal dead zone. Signal readiness
    // through an independent promise instead, and only touch `pipe`/`abort`
    // after the outer `await render(...)` has genuinely resolved.
    let markAllReady!: () => void;
    const allReady = new Promise<void>((resolve) => {
      markAllReady = resolve;
    });

    const request = expressToWebRequest(config.req);
    const { pipe, abort } = await render(request, butteryContext, {
      onShellError() {
        config.res.status(500);
        config.res.set({ "Content-Type": "text/html" });
        config.res.send("<h1>Something went wrong</h1>");
      },
      onAllReady() {
        markAllReady();
      },
      onError(error) {
        didError = true;
        console.error(error);
      }
    });

    await allReady;

    config.res.status(didError ? 500 : 200);
    config.res.set({ "Content-Type": "text/html" });

    // Split the HTML into two parts
    const [htmlStart, htmlEnd] = htmlTemplate.split("<!--ssr-outlet-->");

    // Start writing the first part with the headers
    config.res.write(htmlStart);

    // Stream the chunks in one at a time
    const transformStream = new Transform({
      transform(chunk, encoding, callback) {
        config.res.write(chunk, encoding);
        callback();
      }
    });

    // When the stream is complete, tack on the end of
    // the HTML
    transformStream.on("finish", () => {
      config.res.end(htmlEnd);
    });

    // pipe the stream back into the response
    pipe(transformStream);

    setTimeout(() => {
      abort();
    }, ABORT_DELAY); // 10 seconds
  } catch (e) {
    const error = e as Error;
    // Handle errors with Vite's SSR stack trace
    config.vite.ssrFixStacktrace(error);
    LOG_SERVER_DEV.fatal(error);
    config.res.status(500).end(error.stack);
  }
}
