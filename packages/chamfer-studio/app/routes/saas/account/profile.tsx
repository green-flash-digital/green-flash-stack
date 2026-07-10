import { type FormEventHandler, useCallback, useState } from "react";

import { makeColor, makeFontWeight, makeRem, makeSpace } from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

import { Button } from "~/components/Button";
import { InputGroup } from "~/components/InputGroup";
import { InputLabel } from "~/components/InputLabel";
import { InputSection } from "~/components/InputSection";
import { InputText } from "~/components/InputText";
import { updateUser } from "~/saas/auth/auth.client";

import { useAccountContext } from "./account.context";

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
`;

const profileStyles = css`
  display: flex;
  align-items: center;
  gap: ${makeSpace(16)};
  margin-bottom: ${makeSpace(24)};

  .avatar {
    display: grid;
    place-content: center;
    width: ${makeRem(56)};
    height: ${makeRem(56)};
    border-radius: 50%;
    background: ${makeColor("primary", { opacity: 0.15 })};
    color: ${makeColor("primary-700")};
    font-size: ${makeRem(18)};
    font-weight: ${makeFontWeight("mulish-bold")};
    flex-shrink: 0;
  }

  .name {
    font-size: ${makeRem(16)};
    font-weight: ${makeFontWeight("mulish-bold")};
    color: ${makeColor("neutral-dark")};
  }

  .email {
    margin-top: ${makeSpace(4)};
    font-size: ${makeRem(13)};
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AccountProfilePage() {
  const { user } = useAccountContext();

  const [name, setName] = useState(user.name);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    async (e) => {
      e.preventDefault();
      setPending(true);
      setSaved(false);
      setError(null);
      const res = await updateUser({ name });
      setPending(false);
      if (res.error) {
        setError(res.error.message ?? "Unable to update account");
        return;
      }
      setSaved(true);
    },
    [name]
  );

  return (
    <div className={pageStyles}>
      <div className={headerStyles}>
        <h1>My Account</h1>
        <div className="breadcrumb">Account / Profile</div>
      </div>

      <div className={cardStyles}>
        <div className={profileStyles}>
          <div className="avatar">{getInitials(user.name)}</div>
          <div>
            <div className="name">{user.name}</div>
            <div className="email">{user.email}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <InputSection dxSize="dense">
              <InputLabel dxLabel="Name" dxSize="dense">
                <InputText
                  dxSize="normal"
                  value={name}
                  onChange={(e) => setName(e.currentTarget.value)}
                  required
                />
              </InputLabel>
            </InputSection>
            <InputSection dxSize="dense">
              <InputLabel
                dxLabel="Email"
                dxSize="dense"
                dxHelp="Contact support to change your email address."
              >
                <InputText dxSize="normal" value={user.email} disabled />
              </InputLabel>
            </InputSection>
          </InputGroup>

          {error && <div className={classes(messageStyles, "error")}>{error}</div>}
          {saved && <div className={classes(messageStyles, "success")}>Saved</div>}

          <div className={actionsStyles}>
            <Button
              dxVariant="contained"
              dxColor="primary"
              dxSize="normal"
              type="submit"
              disabled={pending}
            >
              {pending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
