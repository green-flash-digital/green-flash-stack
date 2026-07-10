import { Transform } from "node:stream";

import { ButteryMeta } from "@buttery/meta";
import type { Request, Response } from "express";
import type { ViteDevServer } from "vite";


import { LOG_SERVER_DEV } from "./server-dev.utils.js";

import type { ResolvedButteryDocsConfig } from "../../config/getButteryDocsConfig.js";
import type { ButteryDocsServerContext } from "../server/ButteryDocsServer.js";
import type { createButteryDocsRenderToPipeableStream } from "../server/createRenderFnPipeableStream.js";
import { expressToWebRequest } from "../server/expressToWebRequest.js";
import { generateHTMLTemplate } from "../server/generateHTMLTemplate.js";

const ABORT_DELAY = 10_000;

export async function handleRequestDev(
  render: ReturnType<typeof createButteryDocsRenderToPipeableStream>,
  config: {
    req: Request;
    res: Response;
    dirs: ResolvedButteryDocsConfig["dirs"];
    vite: ViteDevServer;
  }
) {
  try {
    // Instantiate a new Meta class to collect the meta tags for each page
    const Meta = new ButteryMeta();

    // Insert the assets into the HTML template start and end
    LOG_SERVER_DEV.debug("Generating HTML template...");
    const { htmlDev } = generateHTMLTemplate({
      cssLinks: [config.dirs.app.css.docsUI],
      jsScripts: [config.dirs.app.appEntryClient],
      Meta,
    });
    LOG_SERVER_DEV.debug("Generating HTML template... done.");

    // Create the ButteryContext to pass to the render function
    const butteryContext: ButteryDocsServerContext = {
      route: config.req.originalUrl,
      Meta,
    };

    let didError = false;

    // allow vite to inject the necessary scripts
    LOG_SERVER_DEV.debug("Injecting scripts into HTML base...");
    const htmlTemplate = await config.vite.transformIndexHtml(
      config.req.url,
      htmlDev
    );
    LOG_SERVER_DEV.debug("Injecting scripts into HTML base... done");

    // Run the render function imported from the entry-server.ts file
    const request = expressToWebRequest(config.req);
    const { pipe, abort } = await render(request, butteryContext, {
      onShellError() {
        config.res.status(500);
        config.res.set({ "Content-Type": "text/html" });
        config.res.send("<h1>Something went wrong</h1>");
      },
      onAllReady() {
        config.res.status(didError ? 500 : 200);
        config.res.set({ "Content-Type": "text/html" });

        // Split the HTML into two parts
        const [htmlStart, htmlEnd] = htmlTemplate.split("<!--ssr-outlet-->");

        // inject critical css (Hydration issues at the moment)
        // const docsUiCssContent = readFileSync(dirs.app.css.docsUI, "utf8");
        // const { critical } = collect(htmlTemplate, docsUiCssContent);
        // htmlStart = htmlTemplate.replace("<!--ssr-critical-->", critical);

        // Start writing the first part with the headers
        config.res.write(htmlStart);

        // Stream the chunks in one at a time
        const transformStream = new Transform({
          transform(chunk, encoding, callback) {
            config.res.write(chunk, encoding);
            callback();
          },
        });

        // When the stream is complete, tack on the end of
        // the HTML
        transformStream.on("finish", () => {
          config.res.end(htmlEnd);
        });

        // pipe the stream back into the response
        pipe(transformStream);
      },
      onError(error) {
        didError = true;
        console.error(error);
      },
    });

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
