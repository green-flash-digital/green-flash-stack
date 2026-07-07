import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./app/saas/db/schema.ts", "./app/saas/db/auth-schema.ts"],
  out: "./migrations",
  dialect: "sqlite"
});
