import { useCallback } from "react";
import { NavLink, Outlet, useLoaderData, useNavigate } from "react-router";

import {
  makeColor,
  makeFontWeight,
  makeRem,
  makeReset,
  makeSpace
} from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { IconGem } from "~/icons/IconGem";
import { IconLock01 } from "~/icons/IconLock01";
import { IconLogout03 } from "~/icons/IconLogout03";
import { IconUser } from "~/icons/IconUser";
import { signOut } from "~/saas/auth/auth.client";
import { UserContext } from "~/saas/auth/auth.context";
import { DBControllerContext } from "~/saas/database/database.context";
import { errors } from "~/utils/util.error-modes";

import type { Route } from "./+types/layout";
import { AccountProvider } from "./account.context";

export async function loader({ context }: Route.LoaderArgs) {
  const user = context.get(UserContext);
  const db = context.get(DBControllerContext);
  if (!user || !db) {
    throw errors.API_ERROR(500, new Error("No user or database configured"));
  }

  const projects = await db.projects.listForOwner(user.id);
  return { user, projectCount: projects.length };
}

const shellStyles = css`
  height: 100%;
  display: grid;
  grid-template-columns: ${makeRem(220)} 1fr;
`;

const sidebarStyles = css`
  height: 100%;
  overflow-y: auto;
  border-right: ${makeRem(1)} solid ${makeColor("neutral", { opacity: 0.1 })};
  padding: ${makeSpace(16)};
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(4)};

  a,
  button {
    ${makeReset("anchor")};
    ${makeReset("button")};
    display: flex;
    align-items: center;
    gap: ${makeSpace(12)};
    padding: ${makeSpace(8)} ${makeSpace(12)};
    border-radius: ${makeSpace(8)};
    font-size: ${makeRem(14)};
    font-weight: ${makeFontWeight("mulish-medium")};
    color: ${makeColor("neutral", { opacity: 0.6 })};
    cursor: pointer;
    text-align: left;
    width: 100%;
    transition:
      background 0.15s ease-in-out,
      color 0.15s ease-in-out;

    &:hover {
      background: ${makeColor("neutral", { opacity: 0.06 })};
      color: ${makeColor("neutral-dark")};
    }
  }

  a.active {
    background: ${makeColor("primary", { opacity: 0.1 })};
    color: ${makeColor("primary-700")};
  }

  .divider {
    height: ${makeRem(1)};
    background: ${makeColor("neutral", { opacity: 0.1 })};
    margin: ${makeSpace(8)} 0;
  }

  .sign-out:hover {
    background: ${makeColor("danger", { opacity: 0.08 })};
    color: ${makeColor("danger-300")};
  }
`;

const contentStyles = css`
  height: 100%;
  overflow-y: auto;
`;

export default function AccountLayout() {
  const { user, projectCount } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate("/login");
  }, [navigate]);

  return (
    <AccountProvider user={user} projectCount={projectCount}>
      <div className={shellStyles}>
        <nav className={sidebarStyles}>
          <NavLink to="/account/profile">
            <IconUser dxSize={18} />
            Profile
          </NavLink>
          <NavLink to="/account/billing">
            <IconGem dxSize={18} />
            Billing
          </NavLink>
          <NavLink to="/account/security">
            <IconLock01 dxSize={18} />
            Security
          </NavLink>
          <div className="divider" />
          <button type="button" className="sign-out" onClick={handleSignOut}>
            <IconLogout03 dxSize={18} />
            Sign out
          </button>
        </nav>
        <div className={contentStyles}>
          <Outlet />
        </div>
      </div>
    </AccountProvider>
  );
}
