import { classes } from "@buttery/components";
import { makeCustom, makeRem } from "@buttery/tokens/docs";
import { css } from "@linaria/core";
import type { JSX } from "react";
import { forwardRef } from "react";

export type LayoutBodyPropsNative = JSX.IntrinsicElements["main"];
export type LayoutBodyProps = LayoutBodyPropsNative;

const layoutBodyStyles = css`
  display: grid;
  grid-area: layout-body;
  grid-template-columns: ${makeRem(300)} 1fr ${makeRem(300)};
  grid-template-rows: auto 1fr;
  min-height: ${`calc(100vh - ${makeCustom("layout-header-height")})`};
  grid-template-areas:
    "layout-sidebar layout-breadcrumb layout-toc"
    "layout-sidebar layout-main layout-toc";
  max-width: ${makeCustom("layout-max-width")};
  margin: 0 auto;
  width: 100%;
`;

export const LayoutBody = forwardRef<HTMLElement, LayoutBodyProps>(
  function LayoutBody({ children, className, ...restProps }, ref) {
    return (
      <main
        {...restProps}
        className={classes(layoutBodyStyles, className)}
        ref={ref}
      >
        {children}
      </main>
    );
  }
);
