import type { FC } from "react";
import { Link } from "react-router";

import { css } from "@linaria/core";

import { makeColor, makeFontWeight, makeRem } from "@documints/tokens";
import { DocumintsMetaComponent } from "./DocumintsMetaComponent.js";

const containerStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${makeRem(16)};
  padding: ${makeRem(96)} ${makeRem(32)};
  text-align: center;
`;

const codeStyles = css`
  font-size: ${makeRem(72)};
  font-weight: ${makeFontWeight("source-sans-3-bold")};
  color: ${makeColor("primary")};
  margin: 0;
`;

const messageStyles = css`
  font-size: ${makeRem(18)};
  color: ${makeColor("neutral")};
  margin: 0;
`;

const linkStyles = css`
  color: ${makeColor("secondary")};
  font-weight: ${makeFontWeight("source-sans-3-semiBold")};
  text-decoration: underline;
`;

export const NotFoundPage: FC = () => {
  return (
    <div className={containerStyles}>
      <DocumintsMetaComponent title="Page Not Found" />
      <p className={codeStyles}>404</p>
      <p className={messageStyles}>This page doesn't exist.</p>
      <Link to="/" className={linkStyles}>
        Back home
      </Link>
    </div>
  );
};
