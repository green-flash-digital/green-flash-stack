import { createContext } from "react-router";

import type { StorageAdapter } from "./utils/StorageAdapter";

export const TokensPathContext = createContext<string>();
export const VersionsDirContext = createContext<string>();
export const IsLocalContext = createContext<boolean>(false);
export const AdapterContext = createContext<StorageAdapter | null>(null);
