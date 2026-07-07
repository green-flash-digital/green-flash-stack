import { AuthContext } from "~/saas/context.saas";
import { errors } from "~/utils/util.error-modes";

import type { Route } from "./+types/auth";

function handle({ request, context }: Route.LoaderArgs | Route.ActionArgs) {
  const auth = context.get(AuthContext);
  if (!auth) throw errors.API_ERROR(500, new Error("No auth instance configured"));
  return auth.handler(request);
}

export async function loader(args: Route.LoaderArgs) {
  return handle(args);
}

export async function action(args: Route.ActionArgs) {
  return handle(args);
}
