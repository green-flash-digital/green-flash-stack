import type { D1Database } from "@cloudflare/workers-types";

import { ProjectsController } from "../projects/projects.controller";
import { TokensController } from "../tokens/tokens.controller";

/**
 * Single facade over D1 for the deployed Worker. Constructed once per request
 * from the raw binding; exposes feature-scoped controllers as properties.
 */
export class DBController {
  readonly projects: ProjectsController;
  readonly tokens: TokensController;

  constructor(db: D1Database) {
    this.projects = new ProjectsController(db);
    this.tokens = new TokensController(db);
  }
}
