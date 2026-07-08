import { createContext } from "react-router";

import type { ProjectSummary } from "./projects.repo";

export type { ProjectSummary };
export const ActiveProjectContext = createContext<ProjectSummary | null>(null);
