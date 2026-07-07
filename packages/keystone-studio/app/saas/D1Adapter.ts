import type { D1Database } from "@cloudflare/workers-types";
import type { KeystoneTokens } from "@keystone-css/core/schemas";
import { TokensSchema } from "@keystone-css/core/schemas";

import type { StorageAdapter } from "~/utils/StorageAdapter";

/**
 * Reads and writes tokens from a Cloudflare D1 database.
 * Each project's tokens are stored as a JSON blob keyed by projectId.
 */
export class D1Adapter implements StorageAdapter {
  constructor(
    private readonly db: D1Database,
    private readonly projectId: string = "default"
  ) {}

  async read(): Promise<KeystoneTokens> {
    const row = await this.db
      .prepare("SELECT config_json FROM tokens WHERE project_id = ?")
      .bind(this.projectId)
      .first<{ config_json: string }>();

    if (!row) throw new Error(`No tokens found for project: ${this.projectId}`);
    return TokensSchema.parse(JSON.parse(row.config_json));
  }

  async save(tokens: KeystoneTokens): Promise<void> {
    await this.db
      .prepare(
        "INSERT OR REPLACE INTO tokens (project_id, config_json, updated_at) VALUES (?, ?, ?)"
      )
      .bind(this.projectId, JSON.stringify(tokens), new Date().toISOString())
      .run();
  }
}

export type { D1Database };
