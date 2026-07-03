import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";
import {
  makeSpace,
  makeColor,
  makeFontFamily,
  makeFontWeight,
  makeRem
} from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import { match } from "ts-pattern";

type ColorAndVariants = Parameters<typeof makeColor>[0];

import type { IconArrowDown } from "~/icons/IconArrowDown";

export type LabelPropsNative = JSX.IntrinsicElements["span"];
export type LabelPropsCustom = {
  children: string;
  dxSize?: "dense" | "normal" | "large";
  dxColor?: ColorAndVariants;
  DXIconStart?: typeof IconArrowDown;
};
export type LabelProps = LabelPropsNative & LabelPropsCustom;

const styles = css`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-family: ${makeFontFamily("mulish")};
  background: var(--bg-color);
  line-height: 1;
  font-weight: ${makeFontWeight("mulish-semiBold")};
  white-space: nowrap;
  border-radius: ${makeSpace(4)};

  &.s {
    &-dense {
      padding: 0 ${makeSpace(8)};
      height: ${makeSpace(20)};
      font-size: ${makeRem(10)};
      gap: ${makeRem(6)};
    }
  }

  &.s {
    &-normal {
      padding: 0 ${makeRem(10)};
      height: ${makeSpace(24)};
      font-size: ${makeSpace(12)};
      gap: ${makeSpace(8)};
    }
  }

  &.s {
    &-large {
      padding: 0 ${makeSpace(12)};
      height: ${makeSpace(28)};
      font-size: ${makeRem(14)};
      gap: ${makeSpace(12)};
    }
  }
`;

export const Label = forwardRef<HTMLSpanElement, LabelProps>(function Label(
  { children, className, DXIconStart, dxSize = "normal", dxColor = "neutral", ...restProps },
  ref
) {
  return (
    <span
      {...restProps}
      className={classes(styles, { [`s-${dxSize}`]: dxSize }, className)}
      style={{
        // @ts-expect-error CSS doesn't like custom properties but this works well
        ["--bg-color"]: makeColor(dxColor)
      }}
      ref={ref}
    >
      {DXIconStart && (
        <DXIconStart
          dxSize={match(dxSize)
            .with("dense", () => 10)
            .with("normal", () => 12)
            .with("large", () => 14)
            .exhaustive()}
        />
      )}
      {children}
    </span>
  );
});
