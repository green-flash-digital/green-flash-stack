import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import { makeCustom, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type LayoutConfigSectionProps = JSX.IntrinsicElements["div"];

const styles = css`
  display: grid;
  grid-template-columns: ${makeRem(480)} 1fr;
  max-width: ${makeCustom("layout-max-width")};
  margin: 0 auto;
`;

export const LayoutConfigSection = forwardRef<HTMLDivElement, LayoutConfigSectionProps>(
  function LayoutConfigSection({ children, className, ...restProps }, ref) {
    return (
      <div {...restProps} className={classes(styles, className)} ref={ref}>
        {children}
      </div>
    );
  }
);
