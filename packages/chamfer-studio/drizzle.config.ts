import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./app/saas/database/database.schema.ts", "./app/saas/database/database.schema.auth.ts"],
  out: "./migrations",
  dialect: "sqlite"
});
