import { RouterContextProvider, createRequestHandler } from "react-router";

import { CloudflareEnvContext } from "../app/saas/saas.context";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env) {
    const loadContext = new RouterContextProvider(
      new Map([[CloudflareEnvContext, { DB: env.keystone_studio }]])
    );
    return requestHandler(request, loadContext);
  }
} satisfies ExportedHandler<Env>;
