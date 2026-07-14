// add the beginning of your app entry
import "vite/modulepreload-polyfill";
import { createRenderStatic } from "../server.static/index.js";

import { routes } from "./routes.js";

export const render = createRenderStatic(routes);
