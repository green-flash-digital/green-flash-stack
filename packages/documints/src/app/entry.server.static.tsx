// add the beginning of your app entry
// @ts-expect-error - Vite virtual module missing local type definitions
import "vite/modulepreload-polyfill";
import { createRenderStatic } from "../server.static/index.js";

import { routes } from "./routes.js";

export const render = createRenderStatic(routes);
