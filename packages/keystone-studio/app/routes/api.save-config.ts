import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { type ActionFunctionArgs } from "react-router";

import { tryHandle } from "ts-jolt/isomorphic";
import { writeFileRecursive } from "ts-jolt/node";

import { errors } from "~/utils/util.error-modes";
import { getIsLocalConfig, getLocalConfigVars } from "~/utils/util.getLocalConfig";
import { LOG } from "~/utils/util.logger";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const isLocalConfig = getIsLocalConfig();

  const formConfig = String(formData.get("config"));
  const newConfigJson = JSON.parse(formConfig);
  const newConfig = JSON.stringify(newConfigJson, null, 2);

  if (!isLocalConfig) {
    return { config: null };
  }

  const localVars = getLocalConfigVars();

  // Take the existing configuration and write it to a versioned file
  const originalConfig = await readFile(localVars.CONFIG_PATH, {
    encoding: "utf8"
  });
  const originalConfigJson = JSON.parse(originalConfig);
  const newVersionTimestamp = String(new Date().getTime());
  const newVersionPath = path.join(
    localVars.VERSION_DIR,
    `keystone-css.config.${newVersionTimestamp}.json`
  );

  LOG.debug(`Creating a new version of the configuration to: ${newVersionPath}`);
  const newVersion = await tryHandle(writeFileRecursive)(
    newVersionPath,
    JSON.stringify(
      {
        meta: {
          created_at: new Date().toISOString()
        },
        config: originalConfigJson
      },
      null,
      2
    )
  );
  if (newVersion.hasError) {
    return errors.API_ERROR(
      500,
      newVersion.error,
      "Unable to create a new version of the tokens configuration."
    );
  }

  // Save the new configuration
  LOG.debug(`Saving the new configuration to: ${localVars.CONFIG_PATH}`);
  const res = await tryHandle(writeFile)(localVars.CONFIG_PATH, newConfig);
  if (res.hasError) {
    return errors.API_ERROR(500, res.error, "Unable to save the new configuration");
  }
  return { config: newConfigJson };
}
