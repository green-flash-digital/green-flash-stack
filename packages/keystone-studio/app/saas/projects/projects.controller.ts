import type { D1Database } from "@cloudflare/workers-types";
import { generateGUID } from "@green-flash/ts-utils/isomorphic";
import { TokensSchema } from "@keystone-css/core/schemas";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import { projects } from "../database/database.schema";

export type ProjectSummary = {
  id: string;
  name: string;
  createdAt: string;
};

/**
 * `projects` is Drizzle-managed; `tokens` is not (see ../database/database.schema.ts)
 * — so seeding a new project's tokens row uses the same raw-SQL shape
 * ../tokens/tokens.repo.ts reads from. The insert stays a single raw `batch()`
 * call across both tables to keep it atomic.
 */
export class ProjectsClient {
  #db: ReturnType<typeof drizzle>;
  #raw: D1Database;

  constructor(raw: D1Database) {
    this.#raw = raw;
    this.#db = drizzle(raw);
  }

  async listForOwner(ownerId: string): Promise<ProjectSummary[]> {
    const rows = await this.#db
      .select({ id: projects.id, name: projects.name, createdAt: projects.createdAt })
      .from(projects)
      .where(eq(projects.ownerId, ownerId));
    return rows;
  }

  async create(ownerId: string, name: string): Promise<ProjectSummary> {
    const id = generateGUID();
    const now = new Date().toISOString();
    const seedTokens = TokensSchema.parse({});

    await this.#raw.batch([
      this.#raw
        .prepare(
          "INSERT INTO projects (id, owner_id, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
        )
        .bind(id, ownerId, name, now, now),
      this.#raw
        .prepare("INSERT INTO tokens (project_id, config_json, updated_at) VALUES (?, ?, ?)")
        .bind(id, JSON.stringify(seedTokens), now)
    ]);

    return { id, name, createdAt: now };
  }

  async getOwned(projectId: string, ownerId: string): Promise<ProjectSummary | null> {
    const [row] = await this.#db
      .select({ id: projects.id, name: projects.name, createdAt: projects.createdAt })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, ownerId)))
      .limit(1);
    return row ?? null;
  }
}
