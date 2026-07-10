import { type FormEventHandler, useCallback, useState } from "react";

import { makeColor, makeFontWeight, makeRem, makeSpace } from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

import { Button } from "~/components/Button";
import { InputGroup } from "~/components/InputGroup";
import { InputLabel } from "~/components/InputLabel";
import { InputSection } from "~/components/InputSection";
import { InputText } from "~/components/InputText";
import { changePassword } from "~/saas/auth/auth.client";

const pageStyles = css`
  height: 100%;
  overflow-y: auto;
  max-width: ${makeRem(560)};
  margin: 0 auto;
  padding: ${makeSpace(44)} ${makeSpace(24)};
`;

const headerStyles = css`
  h1 {
    margin: 0;
    font-size: ${makeRem(24)};
    font-weight: ${makeFontWeight("mulish-bold")};
    color: ${makeColor("neutral-dark")};
  }

  .breadcrumb {
    margin-top: ${makeSpace(4)};
    font-size: ${makeRem(13)};
    color: ${makeColor("neutral", { opacity: 0.5 })};
  }
`;

const cardStyles = css`
  margin-top: ${makeSpace(24)};
  padding: ${makeSpace(24)};
  border-radius: ${makeSpace(12)};
  border: ${makeRem(1)} solid ${makeColor("neutral", { opacity: 0.12 })};
  background: ${makeColor("surface")};

  h2 {
    margin: 0 0 ${makeSpace(4)} 0;
    font-size: ${makeRem(16)};
    font-weight: ${makeFontWeight("mulish-bold")};
    color: ${makeColor("neutral-dark")};
  }

  p {
    margin: 0 0 ${makeSpace(16)} 0;
    font-size: ${makeRem(14)};
    color: ${makeColor("neutral", { opacity: 0.6 })};
  }
`;

const messageStyles = css`
  margin: ${makeSpace(12)} 0 0 0;
  font-size: ${makeRem(13)};

  &.error {
    color: ${makeColor("danger-300")};
  }

  &.success {
    color: ${makeColor("secondary-500")};
  }
`;

const actionsStyles = css`
  margin-top: ${makeSpace(16)};
`;

export default function AccountSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    async (e) => {
      e.preventDefault();
      setSaved(false);
      setError(null);

      if (newPassword !== confirmPassword) {
        setError("Passwords don't match.");
        return;
      }

      setPending(true);
      const res = await changePassword({ currentPassword, newPassword });
      setPending(false);
      if (res.error) {
        setError(res.error.message ?? "Unable to change password");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaved(true);
    },
    [currentPassword, newPassword, confirmPassword]
  );

  return (
    <div className={pageStyles}>
      <div className={headerStyles}>
        <h1>My Account</h1>
        <div className="breadcrumb">Account / Security</div>
      </div>

      <div className={cardStyles}>
        <h2>Password</h2>
        <p>Update the password you use to sign in to Chamfer Studio.</p>

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <InputSection dxSize="dense">
              <InputLabel dxLabel="Current password" dxSize="dense">
                <InputText
                  dxType="password"
                  dxSize="normal"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.currentTarget.value)}
                  autoComplete="current-password"
                  required
                />
              </InputLabel>
            </InputSection>
            <InputSection dxSize="dense">
              <InputLabel dxLabel="New password" dxSize="dense">
                <InputText
                  dxType="password"
                  dxSize="normal"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.currentTarget.value)}
                  autoComplete="new-password"
                  required
                />
              </InputLabel>
            </InputSection>
            <InputSection dxSize="dense">
              <InputLabel dxLabel="Confirm new password" dxSize="dense">
                <InputText
                  dxType="password"
                  dxSize="normal"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                  autoComplete="new-password"
                  required
                />
              </InputLabel>
            </InputSection>
          </InputGroup>

          {error && <div className={classes(messageStyles, "error")}>{error}</div>}
          {saved && <div className={classes(messageStyles, "success")}>Password updated</div>}

          <div className={actionsStyles}>
            <Button
              dxVariant="contained"
              dxColor="primary"
              dxSize="normal"
              type="submit"
              disabled={pending}
            >
              {pending ? "Updating…" : "Update password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
