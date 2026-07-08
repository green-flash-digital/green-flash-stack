import { createContext } from "react-router";

import type { User } from "better-auth/types";

import type { Auth } from "./auth.server";

export type StudioUser = Pick<User, "id" | "name" | "email">;

export const UserContext = createContext<StudioUser | null>(null);
export const AuthContext = createContext<Auth | null>(null);
