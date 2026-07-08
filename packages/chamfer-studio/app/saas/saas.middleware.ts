import type { Route } from "../+types/root";
import { authMiddleware } from "./auth/auth.middleware";
import { databaseMiddleware } from "./database/database.middleware";
import { projectsMiddleware } from "./projects/projects.middleware";

/**
 * Composes every SaaS-only feature middleware, in dependency order:
 * auth resolves the session, database builds the DBController the rest read
 * from, projects resolves the active project and bridges into AdapterContext.
 * Each one independently early-returns in local mode — see root.tsx for where
 * this gets spread into the full middleware chain.
 */
export const saasMiddlewares: Route.MiddlewareFunction[] = [
  authMiddleware,
  databaseMiddleware,
  projectsMiddleware
];
