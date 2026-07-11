// add the beginning of your app entry
import "vite/modulepreload-polyfill";
import { createRenderDev } from "../server.dev/index.js";

import { routes } from "./routes.js";

export const render = createRenderDev(routes);
