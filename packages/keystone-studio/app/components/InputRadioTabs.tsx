import type { JSX } from "react";
import { forwardRef, useCallback } from "react";
import type { UseTrackingNodeCallback } from "react-hook-primitives";
import { classes, useForwardedRef, useTrackingNode } from "react-hook-primitives";

import { makeSpace, makeColor, makePx, makeRem } from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type InputRadioTabsPropsNative = JSX.IntrinsicElements["div"];
export type InputRadioTabsProps = InputRadioTabsPropsNative;

const styles = css`
  display: flex;
  justify-content: space-evenly;
  gap: ${makeSpace(16)};
  border-radius: ${makeSpace(4)};
  position: relative;
  overflow: hidden;
  border: ${makeRem(1)} solid ${makeColor("neutral-light", { opacity: 0.1 })};

  .tracker {
    position: absolute;
    height: 100%;
    background: ${makeColor("primary-100", { opacity: 0.5 })};
    transition: all 0.15s ease-in-out;
    border-radius: ${makeSpace(4)};
    z-index: 1;
  }
`;

export const InputRadioTabs = forwardRef<HTMLDivElement, InputRadioTabsProps>(
  function InputRadioTabs({ children, className, ...restProps }, forwardedRef) {
    const ref = useForwardedRef(forwardedRef);

    const moveNode = useCallback<UseTrackingNodeCallback<HTMLDivElement, HTMLInputElement>>(
      (anchor, div) => {
        if (!ref.current) return;
        const rect = anchor.getBoundingClientRect();
        div.style.left = makePx(rect.left - ref.current.offsetLeft);
        div.style.width = makePx(rect.width);
      },
      [ref]
    );

    const trackingRef = useTrackingNode(ref, "label:has(input:checked)", moveNode);

    return (
      <div {...restProps} className={classes(styles, className)} ref={ref}>
        <div className="tracker" ref={trackingRef} />
        {children}
      </div>
    );
  }
);
