import { readFile } from "node:fs/promises";

import type { KeystoneConfig } from "@keystone-css/core/schemas";
import { TokensSchema } from "@keystone-css/core/schemas";

import { errors } from "./util.error-modes";
import { LOG } from "./util.logger";

export function getLocalConfigVars() {
  const CONFIG_PATH = process.env.KEYSTONE_CSS_STUDIO_CONFIG_PATH;
  const VERSION_DIR = process.env.KEYSTONE_CSS_STUDIO_VERSION_DIR;
  if (!CONFIG_PATH) {
    throw errors.MISSING_ENV_VAR(
      "The application is running in LOCAL mode but KEYSTONE_CSS_STUDIO_CONFIG_PATH is not set.",
      "KEYSTONE_CSS_STUDIO_CONFIG_PATH"
    );
  }
  if (!VERSION_DIR) {
    throw errors.MISSING_ENV_VAR(
      "The application is running in LOCAL mode but KEYSTONE_CSS_STUDIO_VERSION_DIR is not set.",
      "KEYSTONE_CSS_STUDIO_VERSION_DIR"
    );
  }
  return { CONFIG_PATH, VERSION_DIR };
}

export function getIsLocalConfig() {
  return process.env.KEYSTONE_CSS_STUDIO_IS_LOCAL === "true";
}

async function getLocalConfig(): Promise<KeystoneConfig> {
  const { CONFIG_PATH } = getLocalConfigVars();
  LOG.debug(`Fetching configuration from ${CONFIG_PATH}`);
  const raw = await readFile(CONFIG_PATH, "utf8");
  const parsed = TokensSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw errors.WITH_MESSAGE("tokens.json failed schema validation", parsed.error);
  }
  return parsed.data;
}

export async function getKeystoneConfig(): Promise<KeystoneConfig> {
  if (getIsLocalConfig()) {
    LOG.debug("Running in LOCAL mode — reading tokens.json from disk.");
    return getLocalConfig();
  }

  // TODO: replace with API/D1 fetch once SaaS storage adapter is wired up
  throw new Error("Non-local config loading is not yet implemented.");
}
