import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

import { makeColor, makeCustom, makeFontFamily, makeRem } from "@documints/tokens";

export const bodyStyles = css`
  font-family: ${makeFontFamily("source-sans-3")};
  margin: 0;

  display: grid;
  min-height: 100vh;
  margin: 0 auto;
  // desktop
  // The body row is 1fr (not auto) so it absorbs whatever space is left
  // after the header/footer are subtracted from the 100vh min-height above -
  // that's what keeps the footer pinned to the bottom of the viewport on a
  // short page, instead of leaving a dead gap between short content and a
  // footer that only appears after a full extra viewport of scrolling.
  grid-template-rows: ${makeCustom("layout-header-height")} 1fr auto;
  grid-template-columns: 1fr;
  grid-template-areas:
    "layout-header"
    "layout-body"
    "layout-footer";

  pre {
    padding: ${makeRem(20)};
    overflow-x: auto;
    border-radius: ${makeRem(8)};
    font-size: ${makeRem(12)};

    .line {
      line-height: 1.5;
    }
  }

  .code-block {
    position: relative;
  }

  .copy-code-button {
    position: absolute;
    top: ${makeRem(8)};
    right: ${makeRem(8)};
    padding: ${makeRem(4)} ${makeRem(8)};
    font-size: ${makeRem(12)};
    border-radius: ${makeRem(4)};
    border: ${makeRem(1)} solid ${makeColor("neutral-50", { opacity: 0.3 })};
    background: ${makeColor("background")};
    color: ${makeColor("neutral")};
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s ease-in-out;

    &:hover {
      color: ${makeColor("primary")};
      border-color: ${makeColor("primary")};
    }
  }

  .code-block:hover .copy-code-button,
  .copy-code-button:focus-visible {
    opacity: 1;
  }

  background: ${makeColor("neutral-50", { opacity: 0.12 })};
`;

export type LayoutPropsNative = JSX.IntrinsicElements["div"];
export type LayoutProps = LayoutPropsNative;

export const Layout = forwardRef<HTMLDivElement, LayoutProps>(function Layout(
  { children, className, ...restProps },
  ref
) {
  return (
    <div {...restProps} className={classes(bodyStyles, className)} ref={ref}>
      {children}
    </div>
  );
});
