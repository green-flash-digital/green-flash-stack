import { type FormEventHandler, useCallback, useState } from "react";
import { redirect, useNavigate } from "react-router";

import {
  makeSpace,
  makeColor,
  makeSemanticColor,
  makeRem,
  makeFontFamily
} from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { signIn } from "~/saas/auth.client";
import { UserContext } from "~/saas/context.saas";

import type { Route } from "./+types/login";

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
    color: ${makeSemanticColor("interactive-text")};
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

const footerStyles = css`
  font-size: ${makeRem(13)};
  color: ${makeColor("neutral-light", { opacity: 0.6 })};
  text-align: center;
  display: flex;
  justify-content: space-between;

  a {
    color: ${makeColor("neutral-light")};
  }
`;

export default function LoginPage() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    async (e) => {
      e.preventDefault();
      setError(null);
      setPending(true);
      const form = new FormData(e.currentTarget);
      const res = await signIn.email({
        email: String(form.get("email")),
        password: String(form.get("password"))
      });
      setPending(false);
      if (res.error) {
        setError(res.error.message ?? "Invalid credentials");
        return;
      }
      navigate("/config");
    },
    [navigate]
  );

  return (
    <div className={pageStyles}>
      <div className={cardStyles}>
        <div>
          <h1>Keystone CSS</h1>
          <p>Sign in to your account</p>
        </div>
        <form className={formStyles} onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" name="email" required autoComplete="email" />
          </label>
          <label>
            Password
            <input type="password" name="password" required autoComplete="current-password" />
          </label>
          {error && <div className={errorStyles}>{error}</div>}
          <button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className={footerStyles}>
          <a href="/signup">Create an account</a>
          <a href="/forgot-password">Forgot password?</a>
        </div>
      </div>
    </div>
  );
}
