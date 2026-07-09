import type { JSX } from "react";
import type { MetaFunction } from "react-router";
import { Link } from "react-router";

import {
  makeSpace,
  makeColor,
  makeFontFamily,
  makeFontWeight,
  makeRem,
  makeReset
} from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

import { HomeCodeSampleTabs } from "~/components/HomeCodeSampleTabs";
import { IconArrowDown } from "~/icons/IconArrowDown";
import { IconFiles } from "~/icons/IconFiles";
import { IconPaintBoard } from "~/icons/IconPaintBoard";

export const meta: MetaFunction = () => {
  return [
    { title: "Chamfer CSS Studio" },
    { name: "description", content: "Welcome to the Chamfer CSS Studio!" }
  ];
};

const styles = css`
  height: 100%;
  text-align: center;
  display: grid;
  align-items: center;
  place-content: center;
  width: ${makeRem(640)};
  margin: 0 auto;
  padding: ${makeSpace(44)} ${makeSpace(16)};

  .wordmark {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    text-align: center;

    img {
      height: ${makeRem(100)};
      width: auto;
    }

    span {
      position: relative;
      font-family: ${makeFontFamily("geist")};
      font-weight: ${makeFontWeight("geist-bold")};
      font-size: ${makeRem(64)};
      letter-spacing: -0.02em;
      color: ${makeColor("neutral-dark")};
      left: -${makeRem(16)};
    }
  }

  .intro {
    font-size: ${makeRem(18)};
    line-height: 1.6;
    color: ${makeColor("neutral")};
    display: block;
    margin-top: 0;
  }

  .options {
    margin-top: ${makeSpace(32)};
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${makeSpace(16)};
    width: 100%;
  }

  .code {
    width: 100%;
    min-width: 0;
    text-align: left;
  }
`;

const cardStyles = css`
  ${makeReset("anchor")};
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  gap: ${makeSpace(4)};
  padding: ${makeSpace(28)} ${makeSpace(24)};
  border-radius: ${makeSpace(12)};
  border: ${makeRem(1)} solid ${makeColor("neutral", { opacity: 0.12 })};
  background: ${makeColor("surface")};
  box-shadow: 0 1px 2px ${makeColor("neutral", { opacity: 0.06 })};
  overflow: hidden;
  transition:
    transform 0.18s ease-in-out,
    box-shadow 0.18s ease-in-out,
    border-color 0.18s ease-in-out;

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${makeSpace(36)};
    height: ${makeSpace(36)};
    border-radius: ${makeSpace(12)};
    margin-bottom: ${makeSpace(12)};
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

  .title {
    font-size: ${makeRem(16)};
    font-weight: ${makeFontWeight("mulish-bold")};
    color: ${makeColor("neutral-dark")};
    margin-bottom: ${makeRem(12)};
  }

  .description {
    font-size: ${makeRem(14)};
    line-height: 1.5;
    color: ${makeColor("neutral", { opacity: 0.6 })};
  }

  .arrow {
    position: absolute;
    top: ${makeSpace(24)};
    right: ${makeSpace(20)};
    opacity: 0;
    transform: rotate(-90deg) translateX(4px);
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

  &:hover {
    box-shadow: 0 12px 24px ${makeColor("neutral", { opacity: 0.1 })};
    transform: translateY(-4px);

    .icon {
      transform: scale(1.08);
    }

    .arrow {
      opacity: 1;
      transform: rotate(-90deg) translateX(0);
    }
  }

  &.c-primary:hover {
    border-color: ${makeColor("primary", { opacity: 0.4 })};
  }

  &.c-secondary:hover {
    border-color: ${makeColor("secondary", { opacity: 0.4 })};
  }

  &:active {
    transform: translateY(-1px) scale(0.98);
  }
`;

export default function Index() {
  return (
    <div className={styles}>
      <div className="wordmark">
        <img src="/images/chamfer-logo.png" alt="Chamfer logo" />
        <span>chamfer-css</span>
      </div>
      <p className="intro">
        Design tokens shouldn't be a leap of faith. Define your entire design system once — Chamfer
        turns it into CSS variables and framework agnostic TypeScript functions that reject anything
        that isn't real.
      </p>
      <div className="code">
        <HomeCodeSampleTabs />
      </div>
      <div className="options">
        <OptionCard
          to="/config"
          dxColor="primary"
          DXIcon={IconPaintBoard}
          title="Configure a token set"
          description="Start fresh and define a new design system from scratch."
        />
        <OptionCard
          to="/projects"
          dxColor="secondary"
          DXIcon={IconFiles}
          title="Your projects"
          description="Pick up an existing token set and keep going. (requires login)"
        />
      </div>
    </div>
  );
}

function OptionCard({
  to,
  dxColor,
  DXIcon,
  title,
  description
}: {
  to: string;
  dxColor: "primary" | "secondary";
  DXIcon: (props: { dxSize: number }) => JSX.Element;
  title: string;
  description: string;
}) {
  return (
    <Link to={to} className={classes(cardStyles, `c-${dxColor}`)}>
      <div className="icon">
        <DXIcon dxSize={22} />
      </div>
      <div className="title">{title}</div>
      <div className="description">{description}</div>
      <div className="arrow">
        <IconArrowDown dxSize={16} />
      </div>
    </Link>
  );
}
