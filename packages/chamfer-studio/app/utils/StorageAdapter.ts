import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ChamferTokens } from "@chamfer-css/core/schemas";
import { TokensSchema } from "@chamfer-css/core/schemas";
import { writeFileRecursive } from "@green-flash/ts-utils/node";

export interface StorageAdapter {
  read(): Promise<ChamferTokens>;
  save(tokens: ChamferTokens): Promise<void>;
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

  async read(): Promise<ChamferTokens> {
    const raw = JSON.parse(await readFile(this.tokensPath, "utf8"));
    return TokensSchema.parse(raw);
  }

  async save(tokens: ChamferTokens): Promise<void> {
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
