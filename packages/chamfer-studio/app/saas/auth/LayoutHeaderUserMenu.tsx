import { useCallback } from "react";
import { useNavigate } from "react-router";

import {
  makeSpace,
  makeColor,
  makeSemanticColor,
  makeRem,
  makeReset
} from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { signOut } from "./auth.client";
import type { StudioUser } from "./auth.context";

export type LayoutHeaderUserMenuProps = {
  user: StudioUser;
};

const styles = css`
  justify-self: end;
  display: flex;
  align-items: center;
  gap: ${makeSpace(12)};

  .email {
    font-size: ${makeRem(13)};
    color: ${makeColor("neutral-light", { opacity: 0.6 })};
    max-width: ${makeRem(180)};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .sign-out {
    ${makeReset("button")};
    font-size: ${makeRem(13)};
    color: ${makeColor("neutral-light", { opacity: 0.5 })};
    cursor: pointer;
    padding: ${makeSpace(4)} ${makeSpace(8)};
    border-radius: ${makeSpace(4)};
    border: 1px solid ${makeColor("neutral-light", { opacity: 0.15 })};
    transition: all 0.1s ease-in-out;

    &:hover {
      color: ${makeSemanticColor("interactive-text")};
      border-color: ${makeColor("neutral-light", { opacity: 0.3 })};
    }
  }
`;

export function LayoutHeaderUserMenu({ user }: LayoutHeaderUserMenuProps) {
  const navigate = useNavigate();

  const handleSignOut = useCallback(async () => {
    await signOut();
    navigate("/login");
  }, [navigate]);

  return (
    <div className={styles}>
      <span className="email">{user.email}</span>
      <button className="sign-out" onClick={handleSignOut}>
        Sign out
      </button>
    </div>
  );
}
