import { createContext } from "react-router";

import type { User } from "better-auth/types";

import type { D1Database } from "@cloudflare/workers-types";

import type { Auth } from "./auth";
import type { ProjectsRepo, ProjectSummary } from "./ProjectsRepo";

export type StudioUser = Pick<User, "id" | "name" | "email">;
export type { ProjectsRepo, ProjectSummary };

// The only thing workers/app.ts seeds directly — everything else (auth, session,
// projectsRepo, active-project resolution) is derived from this by saasMiddleware
// (./middleware.saas.ts), keeping the entry point thin.
export type CloudflareEnv = { DB: D1Database };
export const CloudflareEnvContext = createContext<CloudflareEnv | null>(null);

export const UserContext = createContext<StudioUser | null>(null);
export const ProjectsRepoContext = createContext<ProjectsRepo | null>(null);
export const ActiveProjectContext = createContext<ProjectSummary | null>(null);
export const AuthContext = createContext<Auth | null>(null);
