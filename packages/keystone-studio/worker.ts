import { RouterContextProvider } from "react-router";

import type { PagesFunction } from "@cloudflare/workers-types";
import { createRequestHandler } from "@react-router/cloudflare";

import { createAuth } from "./app/auth";
import {
  ActiveProjectContext,
  AdapterContext,
  IsLocalContext,
  ProjectsRepoContext,
  UserContext
} from "./app/context";
import { activeProjectCookie } from "./app/utils/activeProjectCookie";
import { D1ProjectsRepo } from "./app/utils/ProjectsRepo";
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
    const projectsRepo = new D1ProjectsRepo(cloudflare.env.DB);

    const ctx = new RouterContextProvider();
    ctx.set(IsLocalContext, false);
    ctx.set(UserContext, session?.user ?? null);
    ctx.set(ProjectsRepoContext, projectsRepo);

    let activeProject = null;
    if (session?.user) {
      const cookieProjectId = await activeProjectCookie.parse(request.headers.get("Cookie"));
      if (cookieProjectId) {
        activeProject = await projectsRepo.getOwned(cookieProjectId, session.user.id);
      }
    }
    ctx.set(ActiveProjectContext, activeProject);
    ctx.set(
      AdapterContext,
      activeProject ? new D1Adapter(cloudflare.env.DB, activeProject.id) : null
    );
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
