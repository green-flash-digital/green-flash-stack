import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Only `projects` is Drizzle-managed. The `tokens` table (see StorageAdapter.ts)
 * and BetterAuth's user/session/account/verification tables already exist in
 * production out-of-band — declaring them here would make `drizzle-kit generate`
 * try to (re)create tables that already exist.
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
