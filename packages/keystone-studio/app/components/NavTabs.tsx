import type { JSX } from "react";
import { forwardRef, useCallback } from "react";
import type { UseTrackingNodeCallback } from "react-hook-primitives";
import { classes, useForwardedRef, useTrackingNode } from "react-hook-primitives";

import {
  makeSpace,
  makeColor,
  makeFontWeight,
  makePx,
  makeRem,
  makeReset
} from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { NavTabsContextProvider } from "./NavTabs.context";

export type NavTabsPropsNative = JSX.IntrinsicElements["nav"];
export type NavTabsPropsCustom = {
  /**
   * The size of the tabs
   * @default regular
   */
  dxSize?: "regular" | "dense";
  /**
   * The color of the tabs
   * @default primary
   */
  dxColor?: "primary" | "secondary";
  dxInitActiveTab?: string;
};
export type NavTabsProps = NavTabsPropsNative & NavTabsPropsCustom;

const styles = css`
  position: relative;

  ul {
    ${makeReset("ul")};

    display: flex;
    align-items: center;
    gap: ${makeSpace(24)};
    border-bottom: ${makeRem(1)} solid ${makeColor("neutral-light", { opacity: 0.1 })};

    a {
      ${makeReset("anchor")};
    }
    button {
      ${makeReset("button")};
    }

    a,
    button {
      display: grid;
      place-content: center;
      text-transform: uppercase;
      font-weight: ${makeFontWeight("mulish-bold")};
      transition: all 0.15s ease-in-out;
    }
  }

  &.s-regular {
    a,
    button {
      height: ${makeRem(60)};
      font-size: ${makeRem(14)};
    }
  }
  &.s-dense {
    a,
    button {
      height: ${makeRem(30)};
      font-size: ${makeSpace(12)};
    }
  }
  &.c-primary {
    a,
    button {
      &.active {
        color: ${makeColor("primary-500")};
      }
    }
  }
  &.c-secondary {
    a,
    button {
      &.active {
        color: ${makeColor("secondary-500")};
      }
    }
  }
`;

const divStyles = css`
  position: absolute;
  height: ${makeRem(2)};
  bottom: 0;
  transition: all 0.2s ease-in-out;

  &.c-primary {
    background: ${makeColor("primary-500")};
  }
  &.c-secondary {
    background: ${makeColor("secondary-500")};
  }
`;

export const NavTabs = forwardRef<HTMLElement, NavTabsProps>(function NavTabs(
  { children, className, dxInitActiveTab, dxSize = "regular", dxColor = "primary", ...restProps },
  forwardedRef
) {
  const navRef = useForwardedRef(forwardedRef);

  const moveNode = useCallback<UseTrackingNodeCallback<HTMLDivElement, HTMLAnchorElement>>(
    (anchor, div) => {
      if (!navRef.current) return;

      // calculate the left position relative to the container and not the viewport
      // since this can be in a sticky container which would skew the anchorRect
      // calculations
      const containerRect = navRef.current.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const left = anchorRect.left - containerRect.left;

      div.style.left = makePx(left);
      div.style.width = makePx(anchorRect.width);
    },
    [navRef]
  );

  const divRef = useTrackingNode<HTMLDivElement, HTMLAnchorElement>(navRef, ".active", moveNode, {
    attributeFilter: ["class"]
  });

  return (
    <NavTabsContextProvider dxInitActiveTab={dxInitActiveTab}>
      <nav
        {...restProps}
        className={classes(styles, className, {
          [`s-${dxSize}`]: dxSize,
          [`c-${dxColor}`]: dxColor
        })}
        ref={navRef}
      >
        <div
          ref={divRef}
          className={classes(divStyles, {
            [`c-${dxColor}`]: dxColor
          })}
        />
        {children}
      </nav>
    </NavTabsContextProvider>
  );
});
