import type { D1Database } from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";

import { LOG } from "~/utils/util.logger";

import * as authSchema from "../database/database.schema.auth";

export function createAuth(db: D1Database) {
  return betterAuth({
    // A static baseURL can't cover every host this Worker actually serves
    // from: local dev (localhost:5173), per-PR ephemeral preview aliases
    // (pr-<N>-keystone-studio.<subdomain>.workers.dev), and production. This
    // derives it per-request instead, from the incoming Host header, and
    // rejects anything not matching the allowlist below. `protocol` is left
    // at its "auto" default — it reads the scheme off the request itself
    // (http locally, https everywhere Cloudflare fronts it), so it doesn't
    // need to be conditioned on environment either.
    baseURL: {
      allowedHosts: ["localhost:*", "*.workers.dev"]
    },
    database: drizzleAdapter(drizzle(db, { schema: authSchema }), {
      provider: "sqlite",
      schema: authSchema
    }),
    emailAndPassword: {
      enabled: true,
      // Dev/test only — production needs a real email provider (Resend, Postmark,
      // SES, etc.) wired in here instead of this log line. No node:fs here — this
      // runs inside the deployed Cloudflare Worker, which has no filesystem even
      // with nodejs_compat. The E2E suite reads this line back out of the dev
      // server's captured stdout instead of a shared file.
      sendResetPassword: async ({ user, url }) => {
        LOG.debug(`Password reset requested for ${user.email}: ${url}`);
      }
    }
  });
}

export type Auth = ReturnType<typeof createAuth>;
