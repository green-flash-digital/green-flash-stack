import { AdapterContext, IsLocalContext } from "~/context";

import type { Route } from "../../+types/root";
import { UserContext } from "../auth/auth.context";
import { DBControllerContext } from "../database/database.context";
import { activeProjectCookie } from "./projects.activeProjectCookie";
import { ActiveProjectContext } from "./projects.context";

/**
 * Resolves the active project from the request's cookie (re-verifying
 * ownership against D1 on every request) and bridges it into the shared
 * AdapterContext — the same StorageAdapter { read, save } shape
 * FileSystemAdapter provides in local mode, so routes never need to know
 * which platform they're running on.
 */
export const projectsMiddleware: Route.MiddlewareFunction = async ({ context, request }) => {
  if (context.get(IsLocalContext)) return;

  const db = context.get(DBControllerContext);
  const user = context.get(UserContext);

  let activeProject = null;
  if (db && user) {
    const cookieProjectId = await activeProjectCookie.parse(request.headers.get("Cookie"));
    if (cookieProjectId) {
      activeProject = await db.projects.getOwned(cookieProjectId, user.id);
    }
  }

  context.set(ActiveProjectContext, activeProject);
  context.set(
    AdapterContext,
    activeProject && db
      ? {
          read: () => db.tokens.read(activeProject.id),
          save: (tokens) => db.tokens.save(activeProject.id, tokens)
        }
      : null
  );
};
