import { createContext } from "react-router";

import type { ProjectSummary } from "./projects.controller";

export type { ProjectSummary };
export const ActiveProjectContext = createContext<ProjectSummary | null>(null);
