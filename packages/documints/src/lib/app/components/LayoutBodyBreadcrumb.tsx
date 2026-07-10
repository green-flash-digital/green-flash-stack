import { classes } from "@buttery/components";
import {
  makeColor,
  makeCustom,
  makeRem,
  makeReset,
} from "@buttery/tokens/docs";
import { css } from "@linaria/core";
import type { JSX } from "react";
import { forwardRef } from "react";

export type LayoutBodyBreadcrumbPropsNative = JSX.IntrinsicElements["nav"];
export type LayoutBodyBreadcrumbProps = LayoutBodyBreadcrumbPropsNative;

const styles = css`
  grid-area: layout-breadcrumb;
  position: sticky;
  top: ${makeCustom("layout-header-height")};
  background: ${makeColor("background")};
  z-index: 10;

  ul {
    ${makeReset("ul")};
    display: flex;
    gap: ${makeRem(24)};
    padding-top: ${makeRem(24)};
    padding-bottom: ${makeRem(24)};
    margin-left: ${makeRem(32)};
    margin-right: ${makeRem(32)};
    border-bottom: ${makeRem(1)} solid
      ${makeColor("neutral-50", { opacity: 0.5 })};

    & > li {
      position: relative;

      a {
        text-decoration: none;
      }

      &:not(:first-child) {
        &:before {
          position: absolute;
          left: -${makeRem(13)};
          content: "/";
        }
      }
    }
  }
`;

export const LayoutBodyBreadcrumb = forwardRef<
  HTMLElement,
  LayoutBodyBreadcrumbProps
>(function LayoutBodyBreadcrumb({ children, className, ...restProps }, ref) {
  return (
    <nav {...restProps} className={classes(className, styles)} ref={ref}>
      {children}
    </nav>
  );
});
