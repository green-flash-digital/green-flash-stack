import type { ComponentType } from "react";
import { NavLink } from "react-router";

import {
  makeSpace,
  makeColor,
  makeFontWeight,
  makeRem,
  makeReset
} from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

const styles = css`
  a {
    ${makeReset("anchor")};
    display: flex;
    align-items: center;
    gap: ${makeSpace(12)};
    padding: ${makeSpace(8)} ${makeSpace(12)};
    border-radius: ${makeSpace(8)};
    font-size: ${makeRem(14)};
    font-weight: ${makeFontWeight("mulish-medium")};
    color: ${makeColor("neutral-light", { opacity: 0.6 })};
    transition:
      background 0.15s ease-in-out,
      color 0.15s ease-in-out;

    &:hover {
      background: ${makeColor("neutral-light", { opacity: 0.06 })};
      color: ${makeColor("neutral-light", { opacity: 0.9 })};
    }

    &.active {
      background: ${makeColor("primary-500", { opacity: 0.12 })};
      color: ${makeColor("primary-400")};
    }

    @media (max-width: 900px) {
      justify-content: center;
      padding: ${makeSpace(12)};
      margin: ${makeRem(2)} ${makeSpace(4)};

      .label {
        display: none;
      }
    }
  }
`;

export function LayoutNavItem({
  to,
  label,
  DXIcon,
  end
}: {
  to: string;
  label: string;
  DXIcon: ComponentType<React.SVGProps<SVGSVGElement> & { dxSize: number }>;
  end?: boolean;
}) {
  return (
    <div className={styles}>
      <NavLink to={to} end={end} title={label}>
        <DXIcon dxSize={18} />
        <span className="label">{label}</span>
      </NavLink>
    </div>
  );
}
