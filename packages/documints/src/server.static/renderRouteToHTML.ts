import { Writable } from "node:stream";

import type { Toc } from "@stefanprobst/rehype-extract-toc";
import type { Manifest as ViteManifest } from "vite";

import { DocumintsMeta } from "../meta/DocumintsMeta.js";
import type { createDocumintRenderToPipeableStream } from "../server/createRenderFnPipeableStream.js";
import type { DocumintServerContext } from "../server/DocumintServer.js";
import { generateHTMLTemplate } from "../server/generateHTMLTemplate.js";
import { getEntryOnlyAssets, getRouteAssets } from "../server/getRouteAssets.js";

/**
 * Renders a single route to a complete, standalone HTML string - the core of
 * documints' static build. Uses the same pipeable-stream renderer the dev
 * server uses (Node's `renderToPipeableStream`, not the Web-Streams-based
 * `renderToReadableStream`, which only works in Edge/Workers runtimes with
 * native Web Streams support - the static build runs in plain Node.js).
 */
export async function renderRouteToHTML(
  render: ReturnType<typeof createDocumintRenderToPipeableStream>,
  params: {
    routePath: string;
    /**
     * Omit for a route with no doc file backing it (e.g. the 404 page) -
     * its assets are already covered by the entry bundle alone, so there's
     * no per-route chunk to look up.
     */
    aliasPath?: string;
    vManifest: ViteManifest;
    contentRoot: string;
    viteRoot: string;
    head?: string;
    markdownHref?: string;
  }
): Promise<{ html: string; tableOfContents: Toc | null }> {
  const { cssAssets, jsAssets } = params.aliasPath
    ? getRouteAssets(params.aliasPath, params.vManifest, params.contentRoot, params.viteRoot)
    : getEntryOnlyAssets(params.vManifest);

  const Meta = new DocumintsMeta();
  const request = new Request(`http://localhost${params.routePath}`);
  const context: DocumintServerContext = { route: params.routePath, Meta };

  let pipeableResult: Awaited<ReturnType<typeof render>> | undefined;

  // Wait for the full tree to finish (not just the shell) - this is a batch
  // static build, not a live response, so there's no benefit to streaming.
  await new Promise<void>((resolve, reject) => {
    render(request, context, {
      onShellError(error: unknown) {
        reject(error instanceof Error ? error : new Error(String(error)));
      },
      onAllReady() {
        resolve();
      },
      onError(error: unknown) {
        console.error(error);
      }
    }).then((result) => {
      pipeableResult = result;
    }, reject);
  });

  if (!pipeableResult) {
    throw new Error("Rendering finished without producing a pipeable stream.");
  }
  const { pipe } = pipeableResult;

  const chunks: Buffer[] = [];
  const collector = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      callback();
    }
  });

  await new Promise<void>((resolve, reject) => {
    collector.on("finish", resolve);
    collector.on("error", reject);
    pipe(collector);
  });

  const body = Buffer.concat(chunks).toString("utf-8");

  const { htmlStart, htmlEnd } = generateHTMLTemplate({
    cssLinks: cssAssets,
    jsScripts: jsAssets,
    Meta,
    head: params.head,
    markdownHref: params.markdownHref
  });

  return { html: `${htmlStart}${body}${htmlEnd}`, tableOfContents: Meta.tableOfContents };
}
