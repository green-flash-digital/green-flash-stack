import { IsLocalContext } from "~/context";

import type { Route } from "../../+types/root";
import { CloudflareEnvContext } from "../saas.context";
import { DBControllerContext } from "./database.context";
import { DBController } from "./DBController";

/**
 * Constructs the single DBController for this request from the Cloudflare env
 * workers/app.ts seeds into CloudflareEnvContext, and sets it into
 * DBControllerContext for every other SaaS feature to read from.
 */
export const databaseMiddleware: Route.MiddlewareFunction = ({ context }) => {
  if (context.get(IsLocalContext)) return;

  const env = context.get(CloudflareEnvContext);
  if (!env) return;

  context.set(DBControllerContext, new DBController(env.DB));
};
