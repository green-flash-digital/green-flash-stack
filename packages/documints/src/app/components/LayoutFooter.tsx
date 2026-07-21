import type { FC } from "react";

import { makeColor, makeCustom, makeRem, makeReset, makeSpace } from "@documints/tokens";
import { css } from "@linaria/core";

import type { DocumintResolvedHeader } from "../../config/config.utils.js";
import { IconComponent } from "./icons/IconComponent.js";

const footerStyles = css`
  grid-area: layout-footer;
  border-top: 1px solid ${makeColor("neutral-100")};

  & > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${makeRem(16)};
    max-width: ${makeCustom("layout-max-width")};
    margin: 0 auto;
    padding: ${makeSpace(24)} ${makeSpace(32)};
  }
`;

const copyrightStyles = css`
  font-size: ${makeRem(13)};
  color: ${makeColor("neutral-600")};
`;

const socialLinksStyles = css`
  ${makeReset("ul")};
  display: flex;
  align-items: center;
  gap: ${makeRem(16)};
`;

const anchorSocialStyles = css`
  ${makeReset("anchor")};
  display: grid;
  place-content: center;
  transition: color 0.15s ease-in-out;

  &:hover {
    color: ${makeColor("primary")};
  }
`;

export type LayoutFooterProps = {
  header: DocumintResolvedHeader | undefined;
  buildYear: number;
};

export const LayoutFooter: FC<LayoutFooterProps> = ({ header, buildYear }) => {
  const socialLinks = (header?.links ?? [])
    .flat()
    .filter((link) => link.type === "social");

  return (
    <footer className={footerStyles}>
      <div>
        <span className={copyrightStyles}>
          © {buildYear} {header?.title ?? "Documentation"}
        </span>
        {socialLinks.length > 0 && (
          <ul className={socialLinksStyles}>
            {socialLinks.map((link) => (
              <li key={link.href}>
                <a
                  className={anchorSocialStyles}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                >
                  <IconComponent icon="github-circle-solid-rounded" ddSize={20} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
};
