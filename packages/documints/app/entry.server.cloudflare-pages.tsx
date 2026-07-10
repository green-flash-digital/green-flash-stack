// add the beginning of your app entry
// eslint-disable-next-line import/no-unresolved
import "vite/modulepreload-polyfill";

import { createRenderCloudflarePages } from "@buttery/docs/server.cloudflare-pages";

import { routes } from "./routes.js";

export const render = createRenderCloudflarePages(routes);
