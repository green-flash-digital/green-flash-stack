import type { D1Database } from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";

export function createAuth(db: D1Database) {
  return betterAuth({
    database: drizzleAdapter(drizzle(db), { provider: "sqlite" }),
    emailAndPassword: { enabled: true }
  });
}

export type Auth = ReturnType<typeof createAuth>;
