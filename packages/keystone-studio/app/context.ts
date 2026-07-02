import { createContext } from "react-router";

export const TokensPathContext = createContext<string>();
export const VersionsDirContext = createContext<string>();
export const IsLocalContext = createContext<boolean>(false);
