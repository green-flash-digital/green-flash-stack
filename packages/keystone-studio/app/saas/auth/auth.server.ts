import type { D1Database } from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";

import { LOG } from "~/utils/util.logger";

import * as authSchema from "../database/database.schema.auth";

export function createAuth(db: D1Database) {
  return betterAuth({
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
