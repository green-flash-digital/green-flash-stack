import type { JSX } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { makeSpace, makeRem, makeColor } from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type StyleGuidePageLeftPropsNative = JSX.IntrinsicElements["article"];

export type StyleGuidePageLeftPropsCustom = {
  dxMarker: string;
  dxTitle: string;
};
export type StyleGuidePageLeftProps = StyleGuidePageLeftPropsNative & StyleGuidePageLeftPropsCustom;

const styles = css`
  padding: 0 ${makeSpace(32)};
  border-right: 1px solid ${makeColor("neutral-light", { opacity: 0.2 })};
  font-family: "Playfair Display", serif !important;

  .marker {
    font-size: ${makeRem(84)};
    line-height: 1;
    font-family: "Playfair Display";
  }

  .title {
    font-size: ${makeSpace(32)};
    font-weight: 700;
    font-family: "Playfair Display";
    margin-top: ${makeSpace(16)};
    margin-bottom: ${makeSpace(8)};
  }

  .description {
    * {
      font-family: "Playfair Display" !important;
    }
    & > p {
      font-size: ${makeRem(14)} !important;
      font-family: "Playfair Display";
      color: ${makeColor("neutral")} !important;

      & + P {
        margin-top: ${makeSpace(32)};
        border-top: 1px solid ${makeColor("neutral-light", { opacity: 0.2 })};
        padding-top: ${makeSpace(32)};
      }
    }
  }
`;

export const StyleGuidePageLeft = forwardRef<HTMLElement, StyleGuidePageLeftProps>(
  function StyleGuidePageLeft({ className, children, dxMarker, dxTitle, ...restProps }, ref) {
    return (
      <article {...restProps} className={classes(styles, className)} ref={ref}>
        <div className="marker">{dxMarker}</div>
        <div className="title">{dxTitle}</div>
        <div className="description">{children}</div>
      </article>
    );
  }
);
