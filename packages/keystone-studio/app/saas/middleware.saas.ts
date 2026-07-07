import { AdapterContext, IsLocalContext } from "~/context";

import type { Route } from "../+types/root";
import { activeProjectCookie } from "./activeProjectCookie";
import { createAuth } from "./auth";
import {
  ActiveProjectContext,
  AuthContext,
  CloudflareEnvContext,
  ProjectsRepoContext,
  UserContext
} from "./context.saas";
import { D1Adapter } from "./D1Adapter";
import { D1ProjectsRepo } from "./ProjectsRepo";

/**
 * Populates every SaaS-only context (auth session, projects repo, active
 * project, storage adapter) from the raw Cloudflare env that workers/app.ts
 * seeds into CloudflareEnvContext. Mirrors root.tsx's local-mode middleware,
 * which does the equivalent FileSystemAdapter setup — this is the SaaS half of
 * the same pattern, kept out of the entry point so context population always
 * happens the same way (middleware), regardless of platform.
 */
export const saasMiddleware: Route.MiddlewareFunction = async ({ context, request }) => {
  if (context.get(IsLocalContext)) return;

  const env = context.get(CloudflareEnvContext);
  if (!env) return;

  const auth = createAuth(env.DB);
  const session = await auth.api.getSession({ headers: request.headers });
  const projectsRepo = new D1ProjectsRepo(env.DB);

  context.set(UserContext, session?.user ?? null);
  context.set(ProjectsRepoContext, projectsRepo);
  context.set(AuthContext, auth);

  let activeProject = null;
  if (session?.user) {
    const cookieProjectId = await activeProjectCookie.parse(request.headers.get("Cookie"));
    if (cookieProjectId) {
      activeProject = await projectsRepo.getOwned(cookieProjectId, session.user.id);
    }
  }
  context.set(ActiveProjectContext, activeProject);
  context.set(AdapterContext, activeProject ? new D1Adapter(env.DB, activeProject.id) : null);
};
