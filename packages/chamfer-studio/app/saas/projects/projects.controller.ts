import { TokensSchema } from "@chamfer-css/core/schemas";
import type { D1Database } from "@cloudflare/workers-types";
import { generateGUID } from "@green-flash/ts-utils/isomorphic";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import { projects, tokenVersions } from "../database/database.schema";

export type ProjectSummary = {
  id: string;
  name: string;
  createdAt: string;
};

export class ProjectsController {
  #db: ReturnType<typeof drizzle>;

  constructor(raw: D1Database) {
    this.#db = drizzle(raw);
  }

  async listForOwner(ownerId: string): Promise<ProjectSummary[]> {
    const rows = await this.#db
      .select({ id: projects.id, name: projects.name, createdAt: projects.createdAt })
      .from(projects)
      .where(eq(projects.ownerId, ownerId));
    return rows;
  }

  /**
   * Seeds the project's first token_versions row in the same atomic batch as
   * the projects insert, so a project never briefly exists without tokens.
   */
  async create(ownerId: string, name: string): Promise<ProjectSummary> {
    const id = generateGUID();
    const now = new Date().toISOString();
    const seedTokens = TokensSchema.parse({});

    await this.#db.batch([
      this.#db.insert(projects).values({ id, ownerId, name, createdAt: now, updatedAt: now }),
      this.#db.insert(tokenVersions).values({
        id: generateGUID(),
        projectId: id,
        configJson: JSON.stringify(seedTokens),
        createdAt: now
      })
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
