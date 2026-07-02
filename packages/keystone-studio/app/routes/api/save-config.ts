import { tryHandle } from "@green-flash/ts-utils/isomorphic";

import type { Route } from "./+types/save-config";
import { errors } from "~/utils/util.error-modes";
import { LOG } from "~/utils/util.logger";
import { FileSystemAdapter } from "~/utils/StorageAdapter";

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const formConfig = String(formData.get("config"));
  const newConfigJson = JSON.parse(formConfig);

  if (!context.isLocal) {
    return { config: null };
  }

  const adapter = new FileSystemAdapter(context.tokensPath, context.versionsDir);

  LOG.debug(`Saving tokens to: ${context.tokensPath}`);
  const res = await tryHandle(adapter.save.bind(adapter))(newConfigJson);
  if (res.hasError) {
    return errors.API_ERROR(500, res.error, "Unable to save the tokens configuration");
  }

  return { config: newConfigJson };
}
