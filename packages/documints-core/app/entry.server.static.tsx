// add the beginning of your app entry
import "vite/modulepreload-polyfill";
import { createRenderStatic } from "documints/server.static";

import { routes } from "./routes.js";

export const render = createRenderStatic(routes);
