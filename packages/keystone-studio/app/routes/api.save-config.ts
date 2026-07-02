import { FileSystemAdapter } from "~/utils/StorageAdapter";
import { type ActionFunctionArgs } from "react-router";

import { tryHandle } from "ts-jolt/isomorphic";

import { errors } from "~/utils/util.error-modes";
import { getIsLocalConfig, getLocalConfigVars } from "~/utils/util.getLocalConfig";
import { LOG } from "~/utils/util.logger";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const isLocalConfig = getIsLocalConfig();

  const formConfig = String(formData.get("config"));
  const newConfigJson = JSON.parse(formConfig);

  if (!isLocalConfig) {
    return { config: null };
  }

  const localVars = getLocalConfigVars();
  const adapter = new FileSystemAdapter(localVars.CONFIG_PATH, localVars.VERSION_DIR);

  LOG.debug(`Saving tokens to: ${localVars.CONFIG_PATH}`);
  const res = await tryHandle(adapter.save.bind(adapter))(newConfigJson);
  if (res.hasError) {
    return errors.API_ERROR(500, res.error, "Unable to save the tokens configuration");
  }

  return { config: newConfigJson };
}
