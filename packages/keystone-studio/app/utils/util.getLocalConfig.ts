import { readFile } from "node:fs/promises";

import type { KeystoneConfig } from "@keystone-css/core/schemas";
import { TokensSchema } from "@keystone-css/core/schemas";

import { errors } from "./util.error-modes";
import { LOG } from "./util.logger";

export async function readTokensConfig(tokensPath: string): Promise<KeystoneConfig> {
  LOG.debug(`Fetching configuration from ${tokensPath}`);
  const raw = await readFile(tokensPath, "utf8");
  const parsed = TokensSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw errors.WITH_MESSAGE("tokens.json failed schema validation", parsed.error);
  }
  return parsed.data;
}
