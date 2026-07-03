import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { D1Database } from "@cloudflare/workers-types";
import { writeFileRecursive } from "@green-flash/ts-utils/node";
import type { KeystoneTokens } from "@keystone-css/core/schemas";
import { TokensSchema } from "@keystone-css/core/schemas";

export interface StorageAdapter {
  read(): Promise<KeystoneTokens>;
  save(tokens: KeystoneTokens): Promise<void>;
}

/**
 * Reads and writes tokens from the local filesystem.
 * On save, archives the previous tokens.json as a timestamped version snapshot.
 */
export class FileSystemAdapter implements StorageAdapter {
  constructor(
    private readonly tokensPath: string,
    private readonly versionsDir: string
  ) {}

  async read(): Promise<KeystoneTokens> {
    const raw = JSON.parse(await readFile(this.tokensPath, "utf8"));
    return TokensSchema.parse(raw);
  }

  async save(tokens: KeystoneTokens): Promise<void> {
    const current = await readFile(this.tokensPath, "utf8");
    const currentJson = JSON.parse(current) as Record<string, unknown>;
    const existingSchema = currentJson["$schema"] as string | undefined;

    // Archive the current file before overwriting
    const versionPath = path.join(this.versionsDir, `tokens.${Date.now()}.json`);
    await writeFileRecursive(
      versionPath,
      JSON.stringify(
        { meta: { created_at: new Date().toISOString() }, tokens: currentJson },
        null,
        2
      ) + "\n"
    );

    // Write new tokens.json, keeping $schema at the top for VS Code IntelliSense
    const toWrite: Record<string, unknown> = existingSchema
      ? { $schema: existingSchema, ...tokens }
      : { ...tokens };
    await writeFile(this.tokensPath, JSON.stringify(toWrite, null, 2) + "\n", "utf8");
  }
}

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
