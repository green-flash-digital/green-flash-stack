import { createContext } from "react-router";

import type { DBController } from "./DBController";

export const DBControllerContext = createContext<DBController | null>(null);
