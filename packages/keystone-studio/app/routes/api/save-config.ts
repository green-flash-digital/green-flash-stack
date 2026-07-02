import { tryHandle } from "@green-flash/ts-utils/isomorphic";

import { IsLocalContext, TokensPathContext, VersionsDirContext } from "~/context";
import { FileSystemAdapter } from "~/utils/StorageAdapter";
import { errors } from "~/utils/util.error-modes";
import { LOG } from "~/utils/util.logger";

import type { Route } from "./+types/save-config";

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const formConfig = String(formData.get("config"));
  const newConfigJson = JSON.parse(formConfig);

  if (!context.get(IsLocalContext)) {
    return { config: null };
  }

  const tokensPath = context.get(TokensPathContext);
  const adapter = new FileSystemAdapter(tokensPath, context.get(VersionsDirContext));

  LOG.debug(`Saving tokens to: ${tokensPath}`);
  const res = await tryHandle(adapter.save.bind(adapter))(newConfigJson);
  if (res.success === false) {
    return errors.API_ERROR(500, res.error, "Unable to save the tokens configuration");
  }

  return { config: newConfigJson };
}
