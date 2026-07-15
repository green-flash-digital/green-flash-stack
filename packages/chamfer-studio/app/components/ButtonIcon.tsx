import type { JSX, RefCallback } from "react";
import { forwardRef, useCallback, useId } from "react";

import { makeSpace, makeColor, makeRem, makeReset } from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";
import { match } from "ts-pattern";

import type { IconBrush } from "~/icons/IconBrush";

import type { ButtonSharedProps } from "./button.utils";
import { Tooltip, useTooltip } from "./Tooltip";

export type ButtonIconPropsNative = Omit<JSX.IntrinsicElements["button"], "children">;
export type ButtonIconPropsCustom = ButtonSharedProps & {
  dxVariant: "icon";
  /**
   * The style of the icon button
   * @default normal
   */
  dxStyle?: "normal" | "outlined";
  DXIcon: typeof IconBrush;
  /**
   * Optional text that is used to describe button
   * with a tooltip
   */
  dxHelp?: string;
};
export type ButtonIconProps = ButtonIconPropsNative & ButtonIconPropsCustom;

const styles = css`
  ${makeReset("button")};

  aspect-ratio: 1 / 1;
  display: grid;
  place-content: center;
  border-radius: ${makeSpace(4)};
  transition: all 0.15s ease-in-out;
  background: transparent;
  border: ${makeRem(1)} solid transparent;
  cursor: pointer;

  &:hover,
  &:focus {
    outline: none;
    border-color: ${makeColor("neutral-light", { opacity: 0.5 })};
  }
  &:active {
    scale: 0.9;
  }
  &.active {
    background: ${makeColor("neutral-light", { opacity: 0.2 })};
    border-color: ${makeColor("neutral-light", { opacity: 0.5 })};
  }

  svg {
    color: inherit;
  }

  &.s {
    &-dense {
      height: ${makeSpace(24)};
    }
    &-normal {
      height: ${makeSpace(32)};
    }
    &-big {
      height: ${makeSpace(44)};
    }
  }

  &.st {
    &-outlined {
      border-color: ${makeColor("neutral-light", { opacity: 0.3 })};
    }
  }
`;

export const ButtonIcon = forwardRef<HTMLButtonElement, ButtonIconProps>(function ButtonIcon(
  {
    className,
    dxHelp,
    DXIcon,
    dxVariant: _,
    dxSize = "normal",
    dxStyle = "normal",
    type = "button",
    ...restProps
  },
  forwardedRef
) {
  // const { setTargetRef, setTooltipRef } = useTooltip({
  //   dxType: "tooltip",
  //   dxPosition: "top-center",
  //   dxArrow: { size: 8 },
  // });
  // const ref = useForwardedRef(forwardedRef);
  const id = useId();

  // const refCallback = useCallback<RefCallback<HTMLButtonElement>>(
  //   (node) => {
  //     if (!node) return;
  //     ref.current = node;
  //     setTargetRef(node);
  //   },
  //   [ref, setTargetRef]
  // );

  return (
    <>
      <button
        {...restProps}
        type={type}
        ref={forwardedRef}
        aria-labelledby={id}
        className={classes(styles, className, {
          [`s-${dxSize}`]: dxSize,
          [`st-${dxStyle}`]: dxStyle
        })}
      >
        <DXIcon
          dxSize={match(dxSize)
            .with("dense", () => 16)
            .with("normal", () => 20)
            .with("big", () => 28)
            .exhaustive()}
        />
      </button>
      {/* {dxHelp && (
          <Tooltip ref={setTooltipRef} id={id}>
            {dxHelp}
          </Tooltip>
        )} */}
    </>
  );
});
