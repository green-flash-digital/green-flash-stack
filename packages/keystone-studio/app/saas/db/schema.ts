import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * BetterAuth's tables are Drizzle-managed too (see ./auth-schema.ts, generated —
 * do not hand-edit). The `tokens` table (see ../D1Adapter.ts) is deliberately
 * NOT declared here — its shape is dictated by D1Adapter's raw SQL, not Drizzle.
 * See migrations/0001_*.sql and 0002_tokens.sql for the "verify before --remote"
 * caveat and docs/database.md for the full migration convention.
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
