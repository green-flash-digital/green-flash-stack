import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * BetterAuth's tables are Drizzle-managed too (see ./database.schema.auth.ts,
 * generated — do not hand-edit).
 */
export const projects = sqliteTable(
  "projects",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull()
  },
  (table) => [index("projects_owner_id_idx").on(table.ownerId)]
);

/**
 * Append-only — every save is a new row, never an update. "Current" tokens for
 * a project is just the latest row (see ../tokens/tokens.controller.ts). This
 * gives version history for free without a later migration to add it.
 */
export const tokenVersions = sqliteTable(
  "token_versions",
  {
    id: text("id").primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    configJson: text("config_json").notNull(),
    createdAt: text("created_at").notNull()
  },
  (table) => [index("token_versions_project_id_idx").on(table.projectId)]
);
