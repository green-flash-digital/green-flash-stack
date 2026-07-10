import type { Manifest as ViteManifest } from "vite";

import { DocumintsMeta } from "../meta/DocumintsMeta.js";
import type { ButteryDocsServerContext } from "../server/ButteryDocsServer.js";
import type { createButteryDocsRenderToReadableStream } from "../server/createRenderFnReadableStream.js";
import { generateHTMLTemplate } from "../server/generateHTMLTemplate.js";
import { getRouteAssets } from "../server/getRouteAssets.js";

/**
 * Renders a single route to a complete, standalone HTML string - the core of
 * documints' static build. Reuses the same SSR pipeline the old cloudflare-pages
 * runtime used, just written to disk instead of piped to an HTTP response.
 */
export async function renderRouteToHTML(
  render: ReturnType<typeof createButteryDocsRenderToReadableStream>,
  params: {
    routePath: string;
    aliasPath: string;
    vManifest: ViteManifest;
    contentRoot: string;
  }
): Promise<string> {
  const { cssAssets, jsAssets } = getRouteAssets(
    params.aliasPath,
    params.vManifest,
    params.contentRoot
  );

  const Meta = new DocumintsMeta();
  const request = new Request(`http://localhost${params.routePath}`);
  const context: ButteryDocsServerContext = { route: params.routePath, Meta };
  const stream = await render(request, context, 200);

  // Fully read the body *before* building the HTML shell: `Meta.setTitle()`
  // only runs once the tree actually renders (inside `render()`), so
  // `generateHTMLTemplate` must run after, or it captures an empty title.
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let body = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    body += decoder.decode(value, { stream: true });
  }

  const { htmlStart, htmlEnd } = generateHTMLTemplate({
    cssLinks: cssAssets,
    jsScripts: jsAssets,
    Meta,
  });

  return `${htmlStart}${body}${htmlEnd}`;
}
