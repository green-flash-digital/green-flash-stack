import { RouterContextProvider } from "react-router";

import type { PagesFunction } from "@cloudflare/workers-types";
import { createRequestHandler } from "@react-router/cloudflare";
import { drizzle } from "drizzle-orm/d1";

import { createAuth } from "./app/auth";
import { AdapterContext, IsLocalContext, UserContext } from "./app/context";
import { D1Adapter, type D1Database } from "./app/utils/StorageAdapter";

interface Env {
  DB: D1Database;
}

const rrHandler = createRequestHandler<Env>({
  build: () => import("virtual:react-router/server-build"),
  mode: process.env.NODE_ENV,
  getLoadContext: async ({ request, context: { cloudflare } }) => {
    const auth = createAuth(cloudflare.env.DB);
    const session = await auth.api.getSession({ headers: request.headers });

    const ctx = new RouterContextProvider();
    ctx.set(AdapterContext, new D1Adapter(cloudflare.env.DB));
    ctx.set(IsLocalContext, false);
    ctx.set(UserContext, session?.user ?? null);
    return ctx;
  }
});

export const onRequest: PagesFunction<Env> = async (pagesContext) => {
  const url = new URL(pagesContext.request.url);

  if (url.pathname.startsWith("/api/auth")) {
    const auth = createAuth(pagesContext.env.DB);
    return auth.handler(pagesContext.request as unknown as Request) as Promise<Response>;
  }

  return rrHandler(pagesContext);
};
