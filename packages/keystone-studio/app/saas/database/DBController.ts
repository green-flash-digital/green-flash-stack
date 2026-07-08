import type { D1Database } from "@cloudflare/workers-types";

import { ProjectsClient } from "../projects/projects.repo";
import { TokensClient } from "../tokens/tokens.repo";

/**
 * Single facade over D1 for the deployed Worker. Constructed once per request
 * from the raw binding; exposes feature-scoped clients as properties.
 */
export class DBController {
  readonly projects: ProjectsClient;
  readonly tokens: TokensClient;

  constructor(db: D1Database) {
    this.projects = new ProjectsClient(db);
    this.tokens = new TokensClient(db);
  }
}
