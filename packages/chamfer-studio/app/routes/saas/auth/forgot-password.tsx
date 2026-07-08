import { type FormEventHandler, useCallback, useState } from "react";
import { redirect } from "react-router";

import { makeSpace, makeColor, makeRem, makeFontFamily } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { requestPasswordReset } from "~/saas/auth/auth.client";
import { UserContext } from "~/saas/auth/auth.context";

import type { Route } from "./+types/forgot-password";

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

const footerStyles = css`
  font-size: ${makeRem(13)};
  color: ${makeColor("neutral-light", { opacity: 0.6 })};
  text-align: center;

  a {
    color: ${makeColor("neutral-light")};
  }
`;

export default function ForgotPasswordPage() {
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(async (e) => {
    e.preventDefault();
    setPending(true);
    const form = new FormData(e.currentTarget);
    // BetterAuth intentionally responds the same way whether or not the email
    // exists, to avoid leaking account existence — no need to branch on the result.
    await requestPasswordReset({
      email: String(form.get("email")),
      redirectTo: "/reset-password"
    });
    setPending(false);
    setSubmitted(true);
  }, []);

  return (
    <div className={pageStyles}>
      <div className={cardStyles}>
        <div>
          <h1>Keystone CSS</h1>
          <p>Reset your password</p>
        </div>
        {submitted ? (
          <p>If an account exists for that email, check your inbox for a reset link.</p>
        ) : (
          <form className={formStyles} onSubmit={handleSubmit}>
            <label>
              Email
              <input type="email" name="email" required autoComplete="email" />
            </label>
            <button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <div className={footerStyles}>
          <a href="/login">Back to login</a>
        </div>
      </div>
    </div>
  );
}
