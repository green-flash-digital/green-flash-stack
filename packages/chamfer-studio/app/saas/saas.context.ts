import { createContext } from "react-router";

import type { D1Database } from "@cloudflare/workers-types";

// The only thing workers/app.ts seeds directly — everything else (auth,
// session, DBController, active-project resolution) is derived from this by
// the feature middlewares composed in saas.middleware.ts, keeping the entry
// point thin.
export type CloudflareEnv = { DB: D1Database };
export const CloudflareEnvContext = createContext<CloudflareEnv | null>(null);
