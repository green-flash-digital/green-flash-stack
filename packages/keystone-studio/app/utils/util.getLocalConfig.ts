import { readFile } from "node:fs/promises";

import type { KeystoneConfig } from "@keystone-css/core/schemas";
import { TokensSchema } from "@keystone-css/core/schemas";
import { tryHandleSync } from "ts-jolt/isomorphic";

import { errors } from "./util.error-modes";
import { LOG } from "./util.logger";

export function getLocalConfigVars() {
  LOG.debug("Fetching local configuration variables");
  const vars = {
    CONFIG_PATH: String(process.env.KEYSTONE_CSS_STUDIO_CONFIG_PATH),
    VERSION_DIR: String(process.env.KEYSTONE_CSS_STUDIO_VERSION_DIR)
  };
  LOG.debug(JSON.stringify(vars, null, 2));

  return Object.entries(vars).reduce((accum, [varName, varValue]) => {
    if (typeof varValue === "undefined") {
      throw errors.MISSING_ENV_VAR(
        "The application is being run in LOCAL mode but was unable to reconcile some environment variables. This should not have happened. Please raise a GitHub issue.",
        varName
      );
    }
    return Object.assign(accum, { [varName]: varValue });
  }, {}) as typeof vars;
}

export function getIsLocalConfig() {
  const isLocal = process.env.KEYSTONE_CSS_STUDIO_IS_LOCAL;
  return isLocal === "true";
}

async function getLocalConfig() {
  const configPath = process.env.KEYSTONE_CSS_STUDIO_CONFIG_PATH;
  if (!configPath) {
    throw errors.MISSING_ENV_VAR(
      "Unable to determine local path of `keystone-css.config.json`",
      "KEYSTONE_CSS_STUDIO_CONFIG_PATH"
    );
  }
  LOG.debug(`Fetching configuration from path ${configPath}`);
  const rawConfig = await readFile(configPath, { encoding: "utf8" });

  const jsonConfig = tryHandleSync<Record<string, unknown>, [string]>(JSON.parse)(rawConfig);
  if (jsonConfig.hasError) {
    throw errors.WITH_MESSAGE(
      "Error when trying to convert the local configuration into well formed JSON",
      jsonConfig.error
    );
  }
  const parsedConfig = TokensSchema.safeParse(jsonConfig.data);
  if (parsedConfig.error) {
    throw errors.WITH_MESSAGE(
      "Error when trying to parse the local config against the schema",
      parsedConfig.error
    );
  }
  return parsedConfig.data;
}

export async function getKeystoneConfig(): Promise<KeystoneConfig> {
  LOG.debug("Fetching configuration");
  if (getIsLocalConfig()) {
    LOG.debug("Running in LOCAL mode. Fetching local configuration.");
    const config = await getLocalConfig();
    return config;
  }

  // TODO: Fetch the configuration from the API
  const config = TokensSchema.safeParse({});
  if (config.error) {
    throw errors.WITH_MESSAGE(
      "Error when trying to parse the local config against the schema",
      config.error
    );
  }

  return config.data;
}
