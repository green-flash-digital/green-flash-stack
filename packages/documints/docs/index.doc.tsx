/**
---
title: Welcome
home: true
---
*/
import type { ReactNode, SVGProps } from "react";
import { Link } from "react-router";

import {
  makeColor,
  makeCustom,
  makeFontFamily,
  makeFontWeight,
  makeRem
} from "@documints/core/tokens";
import { css } from "@linaria/core";

function cx(...names: (string | false | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

function IconArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" {...props}>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconRocket(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}>
      <path
        d="M5 12h14M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}>
      <path
        d="M4 6a2 2 0 0 1 2-2h5v16H6a2 2 0 0 1-2-2V6ZM20 6a2 2 0 0 0-2-2h-5v16h5a2 2 0 0 0 2-2V6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCode(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}>
      <path
        d="M9 6l-6 6 6 6M15 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconGitHub(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}>
      <path
        fill="currentColor"
        d="M9.941 17.88c0-.363.108-.679.283-.964.12-.196.037-.474-.179-.535C8.255 15.873 7 15.056 7 12.345c0-.704.224-1.367.617-1.944.097-.143.145-.208.158-.28.013-.071-.009-.15-.05-.32a3.65 3.65 0 0 1 .006-1.81c.053-.193.166-.305.37-.284.266.029.727.154 1.409.595.268.173.402.26.52.278.118.02.276-.02.592-.102.432-.11.877-.17 1.378-.17s.946.06 1.378.17c.316.081.474.122.592.102.118-.019.252-.105.52-.278.682-.44 1.143-.566 1.408-.595.205-.021.318.091.371.284.16.586.15 1.214.006 1.81-.041.17-.063.249-.05.32s.06.137.158.28c.393.577.617 1.24.617 1.944 0 2.71-1.255 3.528-3.045 4.036-.216.061-.298.34-.179.535.175.285.283.601.283.965v4.77c4.952-.96 8.691-5.32 8.691-10.552 0-5.937-4.813-10.75-10.75-10.75S1.25 6.162 1.25 12.099c0 5.233 3.739 9.592 8.691 10.553v-2.8a3 3 0 0 1-.199-.03 4 4 0 0 1-.845-.27c-.682-.303-1.534-.885-2.36-1.985a.75.75 0 1 1 1.2-.9c.674.898 1.324 1.316 1.768 1.513.177.079.326.124.436.15z"
      />
    </svg>
  );
}

const links: {
  title: string;
  description: string;
  href: string;
  external?: boolean;
  color: "primary" | "secondary" | "warning" | "danger";
  Icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
}[] = [
  {
    title: "Getting Started",
    description: "Install documints and bootstrap your first project.",
    href: "/getting-started",
    color: "primary",
    Icon: IconRocket
  },
  {
    title: "Guides",
    description: "Day-to-day usage, routing, configuration, and plugins.",
    href: "/guides",
    color: "secondary",
    Icon: IconBook
  },
  {
    title: "Reference",
    description: "The full CLI reference, and how documints works internally.",
    href: "/reference",
    color: "warning",
    Icon: IconCode
  },
  {
    title: "GitHub",
    description: "Browse the source, file an issue, or contribute.",
    href: "https://github.com/green-flash-digital/green-flash-stack",
    external: true,
    color: "danger",
    Icon: IconGitHub
  }
];

const pageStyles = css`
  max-width: ${makeCustom("layout-max-width")};
  margin: 0 auto;
  padding: ${makeRem(64)} ${makeRem(24)} ${makeRem(80)};
`;

const heroStyles = css`
  text-align: center;
  margin-bottom: ${makeRem(48)};

  img {
    height: ${makeRem(100)};
    margin-bottom: ${makeRem(24)};
  }

  p {
    font-family: ${makeFontFamily("source-sans-3")};
    font-size: ${makeRem(18)};
    line-height: 1.6;
    color: ${makeColor("neutral-600")};
    max-width: ${makeRem(560)};
    margin: 0 auto;

    code {
      color: ${makeColor("primary")};
    }
  }
`;

const gridStyles = css`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${makeRem(16)};
`;

const cardStyles = css`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: ${makeRem(4)};
  padding: ${makeRem(24)};
  border-radius: ${makeRem(12)};
  border: 1px solid ${makeColor("neutral-200")};
  background: ${makeColor("surface")};
  box-shadow: 0 1px 2px ${makeColor("neutral", { opacity: 0.06 })};
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transition:
    transform 0.18s ease-in-out,
    box-shadow 0.18s ease-in-out,
    border-color 0.18s ease-in-out;

  .icon {
    display: grid;
    place-content: center;
    width: ${makeRem(36)};
    height: ${makeRem(36)};
    border-radius: ${makeRem(10)};
    margin-bottom: ${makeRem(12)};
    transition: transform 0.18s ease-in-out;
  }

  &.c-primary .icon {
    background: ${makeColor("primary", { opacity: 0.15 })};
    color: ${makeColor("primary-700")};
  }
  &.c-secondary .icon {
    background: ${makeColor("secondary", { opacity: 0.15 })};
    color: ${makeColor("secondary-700")};
  }
  &.c-warning .icon {
    background: ${makeColor("warning", { opacity: 0.15 })};
    color: ${makeColor("warning-700")};
  }
  &.c-danger .icon {
    background: ${makeColor("danger", { opacity: 0.15 })};
    color: ${makeColor("danger-700")};
  }

  .title {
    font-family: ${makeFontFamily("source-sans-3")};
    font-weight: ${makeFontWeight("source-sans-3-semiBold")};
    font-size: ${makeRem(16)};
    margin-bottom: ${makeRem(4)};
  }

  .description {
    font-size: ${makeRem(14)};
    line-height: 1.5;
    color: ${makeColor("neutral-600")};
  }

  .arrow {
    position: absolute;
    top: ${makeRem(24)};
    right: ${makeRem(20)};
    opacity: 0;
    transform: translateX(-4px);
    transition:
      opacity 0.18s ease-in-out,
      transform 0.18s ease-in-out;
  }

  &.c-primary .arrow {
    color: ${makeColor("primary-700")};
  }
  &.c-secondary .arrow {
    color: ${makeColor("secondary-700")};
  }
  &.c-warning .arrow {
    color: ${makeColor("warning-700")};
  }
  &.c-danger .arrow {
    color: ${makeColor("danger-700")};
  }

  &:hover,
  &:focus-visible {
    box-shadow: 0 12px 24px ${makeColor("neutral", { opacity: 0.12 })};
    transform: translateY(-4px);

    .icon {
      transform: scale(1.08);
    }
    .arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }

  &.c-primary:hover {
    border-color: ${makeColor("primary", { opacity: 0.4 })};
  }
  &.c-secondary:hover {
    border-color: ${makeColor("secondary", { opacity: 0.4 })};
  }
  &.c-warning:hover {
    border-color: ${makeColor("warning", { opacity: 0.4 })};
  }
  &.c-danger:hover {
    border-color: ${makeColor("danger", { opacity: 0.4 })};
  }

  &:active {
    transform: translateY(-1px) scale(0.98);
  }
`;

export default function Welcome() {
  return (
    <div className={pageStyles}>
      <div className={heroStyles}>
        <img src="/documints-wordmark.png" alt="documints" />
        <p>
          A static-site generator for documentation, built on a simple idea: the files on disk
          shouldn't dictate your site's structure. Each page carries its own place in the nav
          directly in its frontmatter - just <code>title: Guides/Deployment</code>, no folder
          conventions, no routing config.
        </p>
      </div>

      <div className={gridStyles}>
        {links.map((link) => {
          const className = cx(cardStyles, `c-${link.color}`);
          const content = (
            <>
              <div className="icon">
                <link.Icon />
              </div>
              <div className="title">{link.title}</div>
              <div className="description">{link.description}</div>
              <div className="arrow">
                <IconArrowRight />
              </div>
            </>
          );
          return link.external ? (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={className}
            >
              {content}
            </a>
          ) : (
            <Link key={link.href} to={link.href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
