import { makeColor, makeFontWeight, makeRem, makeSpace } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { Button } from "~/components/Button";

import { useAccountContext } from "./account.context";

const FREE_PLAN_LIMIT = 1;

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

const usageBarStyles = css`
  height: ${makeSpace(8)};
  border-radius: ${makeSpace(4)};
  background: ${makeColor("neutral", { opacity: 0.1 })};
  overflow: hidden;
  margin-bottom: ${makeSpace(16)};

  .fill {
    height: 100%;
    background: ${makeColor("primary-500")};
    border-radius: ${makeSpace(4)};
    transition: width 0.2s ease-in-out;
  }
`;

export default function AccountBillingPage() {
  const { projectCount } = useAccountContext();
  const usagePercent = Math.min((projectCount / FREE_PLAN_LIMIT) * 100, 100);

  return (
    <div className={pageStyles}>
      <div className={headerStyles}>
        <h1>My Account</h1>
        <div className="breadcrumb">Account / Billing</div>
      </div>

      <div className={cardStyles}>
        <h2>Plan</h2>
        <p>
          You&apos;re on the <strong>Free plan</strong>. It includes {FREE_PLAN_LIMIT} design
          system{FREE_PLAN_LIMIT === 1 ? "" : "s"} — additional design systems require a
          subscription.
        </p>
        <div className={usageBarStyles}>
          <div className="fill" style={{ width: `${usagePercent}%` }} />
        </div>
        <p>
          {projectCount} of {FREE_PLAN_LIMIT} included design system
          {FREE_PLAN_LIMIT === 1 ? "" : "s"} used.
        </p>
        <Button dxVariant="outlined" dxColor="primary" dxSize="normal" disabled title="Coming soon">
          Upgrade plan
        </Button>
      </div>
    </div>
  );
}
