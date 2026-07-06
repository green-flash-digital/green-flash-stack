import { createContext } from "react-router";

import type { User } from "better-auth/types";

import type { ProjectsRepo, ProjectSummary } from "./utils/ProjectsRepo";
import type { StorageAdapter } from "./utils/StorageAdapter";

export type StudioUser = Pick<User, "id" | "name" | "email">;
export type { ProjectsRepo, ProjectSummary };

export const TokensPathContext = createContext<string>();
export const VersionsDirContext = createContext<string>();
export const IsLocalContext = createContext<boolean>(false);
export const AdapterContext = createContext<StorageAdapter | null>(null);
export const UserContext = createContext<StudioUser | null>(null);
export const ProjectsRepoContext = createContext<ProjectsRepo | null>(null);
export const ActiveProjectContext = createContext<ProjectSummary | null>(null);
