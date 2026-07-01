import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { makeCustom, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type LayoutConfigSectionPropsNative = JSX.IntrinsicElements["section"];
export type LayoutConfigSectionProps = LayoutConfigSectionPropsNative;

const styles = css`
  display: grid;
  grid-template-columns: ${makeRem(520)} 1fr;
  max-width: ${makeCustom("layout-max-width")};
  margin: 0 auto;
`;

export const LayoutConfigSection = forwardRef<HTMLElement, LayoutConfigSectionProps>(
  function LayoutConfigSection({ children, className, ...restProps }, ref) {
    return (
      <section {...restProps} className={classes(styles, className)} ref={ref}>
        {children}
      </section>
    );
  }
);
