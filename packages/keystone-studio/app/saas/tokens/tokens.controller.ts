import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import type { D1Database } from "@cloudflare/workers-types";
import { generateGUID } from "@green-flash/ts-utils/isomorphic";
import type { KeystoneTokens } from "@keystone-css/core/schemas";
import { TokensSchema } from "@keystone-css/core/schemas";

import { tokenVersions } from "../database/database.schema";

/**
 * Reads and writes a project's tokens from Cloudflare D1. Every save appends a
 * new row to token_versions rather than overwriting — "current" tokens for a
 * project is just the latest row.
 */
export class TokensController {
  #db: ReturnType<typeof drizzle>;

  constructor(raw: D1Database) {
    this.#db = drizzle(raw);
  }

  async read(projectId: string): Promise<KeystoneTokens> {
    const [row] = await this.#db
      .select({ configJson: tokenVersions.configJson })
      .from(tokenVersions)
      .where(eq(tokenVersions.projectId, projectId))
      .orderBy(desc(tokenVersions.createdAt))
      .limit(1);

    if (!row) throw new Error(`No tokens found for project: ${projectId}`);
    return TokensSchema.parse(JSON.parse(row.configJson));
  }

  async save(projectId: string, tokens: KeystoneTokens): Promise<void> {
    await this.#db.insert(tokenVersions).values({
      id: generateGUID(),
      projectId,
      configJson: JSON.stringify(tokens),
      createdAt: new Date().toISOString()
    });
  }
}
