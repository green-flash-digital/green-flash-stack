import { createContext } from "react-router";

import type { User } from "better-auth/types";

import type { StorageAdapter } from "./utils/StorageAdapter";

export type StudioUser = Pick<User, "id" | "name" | "email">;

export const TokensPathContext = createContext<string>();
export const VersionsDirContext = createContext<string>();
export const IsLocalContext = createContext<boolean>(false);
export const AdapterContext = createContext<StorageAdapter | null>(null);
export const UserContext = createContext<StudioUser | null>(null);
