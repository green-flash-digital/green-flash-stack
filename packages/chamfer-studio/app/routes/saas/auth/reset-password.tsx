import { type FormEventHandler, useCallback, useState } from "react";
import { redirect, useNavigate, useSearchParams } from "react-router";

import { makeSpace, makeColor, makeRem, makeFontFamily } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { resetPassword } from "~/saas/auth/auth.client";
import { UserContext } from "~/saas/auth/auth.context";

import type { Route } from "./+types/reset-password";

// root.tsx's middleware already redirects local-CLI-mode requests to /config
// before this loader ever runs — only the already-authed case needs handling here.
export async function loader({ context }: Route.LoaderArgs) {
  if (context.get(UserContext)) throw redirect("/config");
  return null;
}

const pageStyles = css`
  display: grid;
  place-content: center;
  min-height: 100dvh;
  background: ${makeColor("neutral-dark")};
`;

const cardStyles = css`
  width: ${makeRem(360)};
  background: ${makeColor("neutral-dark", { opacity: 0.6 })};
  border: 1px solid ${makeColor("neutral-light", { opacity: 0.1 })};
  border-radius: ${makeSpace(8)};
  padding: ${makeSpace(32)};
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(24)};

  h1 {
    margin: 0;
    font-size: ${makeRem(20)};
    font-family: ${makeFontFamily("mulish")};
    color: ${makeColor("neutral-light")};
  }

  p {
    margin: 0;
    font-size: ${makeRem(14)};
    color: ${makeColor("neutral-light", { opacity: 0.6 })};
  }
`;

const formStyles = css`
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(16)};

  label {
    display: flex;
    flex-direction: column;
    gap: ${makeSpace(6)};
    font-size: ${makeRem(13)};
    color: ${makeColor("neutral-light", { opacity: 0.7 })};
  }

  input {
    height: ${makeSpace(36)};
    padding: 0 ${makeSpace(12)};
    background: ${makeColor("neutral-light", { opacity: 0.07 })};
    border: 1px solid ${makeColor("neutral-light", { opacity: 0.15 })};
    border-radius: ${makeSpace(4)};
    color: ${makeColor("neutral-light")};
    font-size: ${makeRem(14)};
    outline: none;

    &:focus {
      border-color: ${makeColor("secondary-400")};
    }
  }

  button[type="submit"] {
    height: ${makeSpace(36)};
    background: ${makeColor("secondary-500")};
    color: ${makeColor("neutral-light")};
    border: none;
    border-radius: ${makeSpace(4)};
    font-size: ${makeRem(14)};
    cursor: pointer;
    margin-top: ${makeSpace(8)};

    &:hover {
      background: ${makeColor("secondary-400")};
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const errorStyles = css`
  font-size: ${makeRem(13)};
  color: ${makeColor("error-400", { opacity: 0.9 })};
`;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    async (e) => {
      e.preventDefault();
      setError(null);

      if (!token) {
        setError("This reset link is invalid or has expired.");
        return;
      }

      const form = new FormData(e.currentTarget);
      const newPassword = String(form.get("newPassword"));
      const confirmPassword = String(form.get("confirmPassword"));
      if (newPassword !== confirmPassword) {
        setError("Passwords don't match.");
        return;
      }

      setPending(true);
      const res = await resetPassword({ newPassword, token });
      setPending(false);
      if (res.error) {
        setError(res.error.message ?? "Unable to reset password");
        return;
      }
      navigate("/login");
    },
    [navigate, token]
  );

  return (
    <div className={pageStyles}>
      <div className={cardStyles}>
        <div>
          <h1>Chamfer CSS</h1>
          <p>Choose a new password</p>
        </div>
        {token ? (
          <form className={formStyles} onSubmit={handleSubmit}>
            <label>
              New password
              <input type="password" name="newPassword" required autoComplete="new-password" />
            </label>
            <label>
              Confirm password
              <input type="password" name="confirmPassword" required autoComplete="new-password" />
            </label>
            {error && <div className={errorStyles}>{error}</div>}
            <button type="submit" disabled={pending}>
              {pending ? "Resetting…" : "Reset password"}
            </button>
          </form>
        ) : (
          <div className={errorStyles}>This reset link is invalid or has expired.</div>
        )}
      </div>
    </div>
  );
}
