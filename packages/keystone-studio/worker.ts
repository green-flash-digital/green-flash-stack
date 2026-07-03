import { createRequestHandler } from "@react-router/cloudflare";
import { RouterContextProvider } from "react-router";

import { AdapterContext, IsLocalContext } from "./app/context";
import { D1Adapter, type D1Database } from "./app/utils/StorageAdapter";

interface Env {
  DB: D1Database;
}

export const onRequest = createRequestHandler<Env>({
  build: () => import("virtual:react-router/server-build"),
  mode: process.env.NODE_ENV,
  getLoadContext: ({ context: { cloudflare } }) => {
    const ctx = new RouterContextProvider();
    ctx.set(AdapterContext, new D1Adapter(cloudflare.env.DB));
    ctx.set(IsLocalContext, false);
    return ctx;
  }
});
