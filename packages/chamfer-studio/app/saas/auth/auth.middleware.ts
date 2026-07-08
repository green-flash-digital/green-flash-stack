import { IsLocalContext } from "~/context";

import type { Route } from "../../+types/root";
import { CloudflareEnvContext } from "../saas.context";
import { AuthContext, UserContext } from "./auth.context";
import { createAuth } from "./auth.server";

/**
 * Constructs the BetterAuth instance for this request and resolves the
 * session, setting AuthContext/UserContext for every other SaaS feature (and
 * routes) to read from.
 */
export const authMiddleware: Route.MiddlewareFunction = async ({ context, request }) => {
  if (context.get(IsLocalContext)) return;

  const env = context.get(CloudflareEnvContext);
  if (!env) return;

  const auth = createAuth(env.DB);
  const session = await auth.api.getSession({ headers: request.headers });

  context.set(AuthContext, auth);
  context.set(UserContext, session?.user ?? null);
};
