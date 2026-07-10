import type { JSX } from "react";
import { forwardRef } from "react";

import { makeSpace, makeColor, makeRem } from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

export type StyleGuidePagePropsNative = JSX.IntrinsicElements["section"];
export type StyleGuidePageProps = StyleGuidePagePropsNative;

const styles = css`
  display: grid;
  grid-template-columns: ${`${makeRem(300)} auto`};
  gap: ${makeSpace(32)};
  padding-bottom: ${makeRem(100)} !important;

  &:not(:last-child) {
    border-bottom: 1px solid ${makeColor("neutral-light", { opacity: 0.2 })};
    margin-bottom: ${makeRem(100)};
  }

  @media print {
    border-bottom: none !important;
    margin-bottom: 0 !important;
    padding-bottom: 0 !important;
    padding: 0 !important;
  }
`;

export const StyleGuidePage = forwardRef<HTMLElement, StyleGuidePageProps>(function StyleGuidePage(
  { children, className, ...restProps },
  ref
) {
  return (
    <section {...restProps} className={classes(styles, "page", className)} ref={ref}>
      {children}
    </section>
  );
});
