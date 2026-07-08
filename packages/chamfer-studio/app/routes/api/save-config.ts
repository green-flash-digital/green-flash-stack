import { tryHandle } from "@green-flash/ts-utils/isomorphic";

import { AdapterContext } from "~/context";
import { errors } from "~/utils/util.error-modes";
import { LOG } from "~/utils/util.logger";

import type { Route } from "./+types/save-config";

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const formConfig = String(formData.get("config"));
  const newConfigJson = JSON.parse(formConfig);

  const adapter = context.get(AdapterContext);
  if (!adapter) throw errors.API_ERROR(500, new Error("No storage adapter configured"));

  LOG.debug("Saving tokens via storage adapter");
  const res = await tryHandle(adapter.save.bind(adapter))(newConfigJson);
  if (res.success === false) {
    return errors.API_ERROR(500, res.error, "Unable to save the tokens configuration");
  }

  return { config: newConfigJson };
}
