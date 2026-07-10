import type { FC, ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

import type { StudioUser } from "~/saas/auth/auth.context";

export type AccountContextType = {
  user: StudioUser;
  projectCount: number;
};

const AccountContext = createContext<AccountContextType | null>(null);

export type AccountProviderProps = AccountContextType & { children: ReactNode };

export const AccountProvider: FC<AccountProviderProps> = ({ children, user, projectCount }) => {
  const value = useMemo<AccountContextType>(() => ({ user, projectCount }), [user, projectCount]);
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

export const useAccountContext = (): AccountContextType => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("'useAccountContext()' must be used within an <AccountProvider /> component");
  }
  return context;
};
