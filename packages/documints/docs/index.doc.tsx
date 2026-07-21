/**
---
title: Welcome
home: true
---
*/
import type { ReactNode, SVGProps } from "react";
import { Link } from "react-router";

import { makeColor, makeCustom, makeFontFamily, makeFontWeight, makeRem } from "@documints/tokens";
import { css } from "@linaria/core";

function cx(...names: (string | false | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

function IconSparkle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}>
      <path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function IconFilePlus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}>
      <path
        d="M6 3a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5H6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M13 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function IconAtom(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}>
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        stroke="currentColor"
        strokeWidth="1.5"
        transform="rotate(0 12 12)"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        stroke="currentColor"
        strokeWidth="1.5"
        transform="rotate(60 12 12)"
      />
      <ellipse
        cx="12"
        cy="12"
        rx="10"
        ry="4"
        stroke="currentColor"
        strokeWidth="1.5"
        transform="rotate(120 12 12)"
      />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconBolt(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" />
    </svg>
  );
}

function IconTree(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}>
      <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="19" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="19" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 7v4m0 0-6 6m6-6 6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPlug(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}>
      <path
        d="M9 2v4M15 2v4M7 8h10v4a5 5 0 0 1-10 0V8ZM12 17v5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLink(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}>
      <path
        d="M9 15 15 9M8 12l-2.5 2.5a3 3 0 0 0 4.24 4.24L12 16.5M16 12l2.5-2.5a3 3 0 0 0-4.24-4.24L12 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLayers(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...props}>
      <path
        d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const features: {
  title: string;
  description: string;
  color: "primary" | "secondary" | "warning" | "danger";
  Icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
}[] = [
  {
    title: "Human Pages. AI-Ready Source.",
    description:
      "Every document becomes a polished web page and clean, directly readable Markdown for agents, crawlers, and developer tools.",
    color: "primary",
    Icon: IconSparkle
  },
  {
    title: "Write Docs Anywhere",
    description:
      "Add .doc.md, .doc.mdx, or .doc.tsx to any package or folder. Documints discovers it without forcing your content into a separate docs directory.",
    color: "secondary",
    Icon: IconFilePlus
  },
  {
    title: "Full React Pages",
    description:
      "Build entire documentation pages with .doc.tsx using real React, state, components, and interactions—not a restricted docs-specific abstraction.",
    color: "warning",
    Icon: IconAtom
  },
  {
    title: "Static by Default",
    description:
      "Every route prerenders to complete HTML. Deploy fast, durable files anywhere with no production server or framework runtime.",
    color: "danger",
    Icon: IconBolt
  },
  {
    title: "Content-Driven Routing",
    description:
      "Define hierarchy with document metadata instead of folder structure. Reorganize source files without changing public URLs.",
    color: "primary",
    Icon: IconTree
  },
  {
    title: "The Vite Ecosystem",
    description:
      "Use standard Vite plugins from npm alongside Documints plugins. No proprietary plugin system or parallel toolchain to learn.",
    color: "secondary",
    Icon: IconPlug
  },
  {
    title: "Colocated by Design",
    description:
      "Keep documentation beside the code it describes. Documints uses configurable globs to discover documents across your entire repository.",
    color: "warning",
    Icon: IconLink
  },
  {
    title: "Markdown When You Want It",
    description:
      "Write focused prose in Markdown, add live React with MDX, or use TSX for fully interactive pages—all inside one documentation corpus.",
    color: "danger",
    Icon: IconLayers
  }
];

const pageStyles = css`
  max-width: ${makeCustom("layout-max-width")};
  margin: 0 auto;
  padding: ${makeRem(64)} ${makeRem(24)} ${makeRem(96)};
`;

const heroStyles = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: ${makeRem(64)};

  img.wordmark {
    height: ${makeRem(100)};
    margin-bottom: ${makeRem(24)};
  }

  h1 {
    font-family: ${makeFontFamily("source-sans-3")};
    font-weight: ${makeFontWeight("source-sans-3-bold")};
    font-size: ${makeRem(48)};
    line-height: 1.15;
    margin: 0 0 ${makeRem(16)};
    max-width: ${makeRem(800)};
  }

  p {
    font-family: ${makeFontFamily("source-sans-3")};
    font-size: ${makeRem(20)};
    line-height: 1.6;
    color: ${makeColor("neutral-600")};
    margin: 0 0 ${makeRem(32)} 0;
    max-width: ${makeRem(800)};

    & + p {
      color: ${makeColor("neutral-900")};
      font-size: ${makeRem(24)};
    }

    code {
      color: ${makeColor("primary")};
      background: ${makeColor("primary", { opacity: 0.1 })};
      padding: 0.15em 0.4em;
      border-radius: 0.3em;
    }
  }
`;

const heroVideoWrapperStyles = css`
  max-width: ${makeRem(1152)};
  margin: 0 auto ${makeRem(80)};
`;

const ctaGroupStyles = css`
  display: flex;
  justify-content: center;
  gap: ${makeRem(12)};
`;

const ctaBaseStyles = css`
  display: inline-flex;
  align-items: center;
  font-family: ${makeFontFamily("source-sans-3")};
  font-weight: ${makeFontWeight("source-sans-3-semiBold")};
  font-size: ${makeRem(15)};
  padding: ${makeRem(10)} ${makeRem(20)};
  border-radius: 999px;
  text-decoration: none;
  transition: all 0.15s ease-in-out;
`;

const ctaPrimaryStyles = css`
  background: ${makeColor("primary-600")};
  color: white;
  border: 1px solid ${makeColor("primary-600")};

  &:hover {
    background: ${makeColor("primary-900")};
    border-color: ${makeColor("primary-900")};
  }
`;

const ctaSecondaryStyles = css`
  background: transparent;
  color: ${makeColor("neutral-800")};
  border: 1px solid ${makeColor("neutral-200")};

  &:hover {
    border-color: ${makeColor("neutral-400")};
    background: ${makeColor("neutral-50")};
  }
`;

const heroVideoStyles = css`
  display: block;
  width: 100%;
  height: auto;
  border-radius: ${makeRem(12)};
  box-shadow:
    0 0 40px ${makeColor("primary", { opacity: 0.2 })},
    0 0 100px ${makeColor("neutral-900", { opacity: 0.3 })},
    0 0 200px ${makeColor("neutral-900", { opacity: 0.18 })},
    0 0 340px ${makeColor("neutral", { opacity: 0.1 })};
`;

const sectionIntroStyles = css`
  max-width: ${makeRem(720)};
  margin: 0 auto ${makeRem(48)};
  text-align: center;

  h2 {
    font-family: ${makeFontFamily("source-sans-3")};
    font-weight: ${makeFontWeight("source-sans-3-bold")};
    font-size: ${makeRem(32)};
    line-height: 1.2;
    margin: 0 0 ${makeRem(12)};
  }

  p {
    font-family: ${makeFontFamily("source-sans-3")};
    font-size: ${makeRem(18)};
    line-height: 1.6;
    color: ${makeColor("neutral-600")};
    margin: 0;
  }
`;

const gridStyles = css`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${makeRem(16)};
  max-width: ${makeRem(1152)};
`;

const cardStyles = css`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: ${makeRem(4)};
  padding: ${makeRem(20)};
  border-radius: ${makeRem(12)};
  border: 1px solid transparent;
  background: ${makeColor("neutral-100", { opacity: 0.2 })};
  box-shadow: 0 1px 2px ${makeColor("neutral", { opacity: 0.06 })};
  color: inherit;
  overflow: hidden;
  transition:
    transform 0.18s ease-in-out,
    box-shadow 0.18s ease-in-out,
    border-color 0.18s ease-in-out;

  .icon {
    display: grid;
    place-content: center;
    width: ${makeRem(32)};
    height: ${makeRem(32)};
    border-radius: ${makeRem(9)};
    margin-bottom: ${makeRem(10)};
    transition: transform 0.18s ease-in-out;
  }

  &.c-primary {
    border-color: ${makeColor("primary", { opacity: 0.18 })};
  }
  &.c-primary .icon {
    background: ${makeColor("primary", { opacity: 0.2 })};
    color: ${makeColor("primary-700")};
  }

  &.c-secondary {
    border-color: ${makeColor("secondary", { opacity: 0.18 })};
  }
  &.c-secondary .icon {
    background: ${makeColor("secondary", { opacity: 0.2 })};
    color: ${makeColor("secondary-700")};
  }

  &.c-warning {
    border-color: ${makeColor("warning", { opacity: 0.18 })};
  }
  &.c-warning .icon {
    background: ${makeColor("warning", { opacity: 0.2 })};
    color: ${makeColor("warning-700")};
  }

  &.c-danger {
    border-color: ${makeColor("danger", { opacity: 0.18 })};
  }
  &.c-danger .icon {
    background: ${makeColor("danger", { opacity: 0.2 })};
    color: ${makeColor("danger-700")};
  }

  .title {
    font-family: ${makeFontFamily("source-sans-3")};
    font-weight: ${makeFontWeight("source-sans-3-semiBold")};
    font-size: ${makeRem(18)};
    margin-bottom: ${makeRem(4)};
  }

  .description {
    font-size: ${makeRem(13)};
    line-height: 1.5;
    color: ${makeColor("neutral-700")};
  }

  &:hover {
    box-shadow: 0 12px 24px ${makeColor("neutral", { opacity: 0.12 })};
    transform: translateY(-4px);

    .icon {
      transform: scale(1.08);
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
`;

export default function Welcome() {
  return (
    <div className={pageStyles}>
      <div className={heroStyles}>
        <img className="wordmark" src="/documints-wordmark.png" alt="documints" />
        <h1>Build a documentation corpus, not just a website.</h1>
        <p>
          Documints turns one canonical source into polished pages for humans and structured
          knowledge for machines. Write naturally in Markdown and React. Documints generates the
          website, clean Markdown, search, and agent-ready context automatically.
        </p>
        <p>
          <strong>Human-readable by design. Machine-readable by default.</strong>
        </p>
        <div className={ctaGroupStyles}>
          <Link
            to="/guides/introduction/why-documints"
            className={cx(ctaBaseStyles, ctaPrimaryStyles)}
          >
            Why Documints?
          </Link>
          <Link
            to="/guides/introduction/getting-started"
            className={cx(ctaBaseStyles, ctaSecondaryStyles)}
          >
            Get Started
          </Link>
          <a
            href="https://github.com/green-flash-digital/green-flash-stack"
            target="_blank"
            rel="noreferrer"
            className={cx(ctaBaseStyles, ctaSecondaryStyles)}
          >
            View on GitHub
          </a>
        </div>
      </div>

      <div className={heroVideoWrapperStyles}>
        <video className={heroVideoStyles} src="/animation.mp4" autoPlay loop muted playsInline />
      </div>

      <div className={sectionIntroStyles}>
        <h2>Documentation without the usual constraints</h2>
        <p>
          Keep docs close to the code they explain, choose the right format for every page, and
          publish one fast, flexible corpus for humans and AI.
        </p>
      </div>

      <div className={gridStyles}>
        {features.map((feature) => (
          <div key={feature.title} className={cx(cardStyles, `c-${feature.color}`)}>
            <div className="icon">
              <feature.Icon />
            </div>
            <div className="title">{feature.title}</div>
            <div className="description">{feature.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
