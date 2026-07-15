import type { FocusEventHandler, JSX } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { classes } from "@stratum-ui/core";
import { usePopover } from "@stratum-ui/react/popover";

import { makeSpace, makeColor, makeRem } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { IconArrowDown } from "~/icons/IconArrowDown";

import { InputDropdownSelectProvider } from "./InputDropdownSelect.context";
import type { InputTextPropsCustom } from "./InputText";
import { InputText } from "./InputText";

export type InputDropdownSelectPropsNative = JSX.IntrinsicElements["input"];
export type InputDropdownSelectPropsCustom = InputTextPropsCustom & {
  dxOnSelect: (value: string) => void;
};
export type InputDropdownSelectProps = InputDropdownSelectPropsNative &
  InputDropdownSelectPropsCustom;

const styles = css`
  opacity: 0;
  border: none;
  transform: scale(0.9);
  filter: drop-shadow(3px 8px 28px rgba(130, 130, 130, 0.3));
  border-radius: 0.5rem;
  padding: 0;

  /* Animation for appearing */
  @keyframes appear {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Animation for disappearing */
  @keyframes disappear {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.9);
    }
  }

  &.open {
    animation: appear 0.15s forwards;
  }

  &.close {
    animation: disappear 0.15s forwards;
  }
`;

const textContainerStyles = css`
  position: relative;
  display: inline-block;

  input {
    cursor: pointer;
    background: white;
  }

  .icon {
    display: grid;
    place-content: center;
    position: absolute;
    transition: all 0.1s ease-in-out;
    color: ${makeColor("neutral", { opacity: 0.3 })};
    pointer-events: none;
  }

  &:has(input.s-dense) {
    .icon {
      height: ${makeSpace(24)};
      aspect-ratio: 1 / 1;
      right: 0;
      top: 50%;
      margin-top: -${makeRem(24 / 2)};
    }
  }
  &:has(input:focus) {
    .icon {
      color: ${makeColor("primary-100")};
    }
  }
`;

export const InputDropdownSelect = forwardRef<HTMLInputElement, InputDropdownSelectProps>(
  function InputDropdown(
    { children, className, dxSize, dxOnSelect, onFocus, ...restProps },
    forwardedRef
  ) {
    const targetRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(forwardedRef, () => targetRef.current as HTMLInputElement);

    const { engine, state, popoverRef, close } = usePopover();

    const handleFocus = useCallback<FocusEventHandler<HTMLInputElement>>(
      (e) => {
        onFocus?.(e);
        if (state.isOpen) return;
        engine.openPopover({ currentTarget: targetRef.current } as unknown as Event);
      },
      [engine, onFocus, state.isOpen]
    );

    const handleSelect = useCallback<(value: string) => void>(
      (value) => {
        if (!targetRef.current) return;
        targetRef.current.value = value;
        if (dxOnSelect) dxOnSelect(value);
        close();
      },
      [close, dxOnSelect]
    );

    return (
      <div>
        <div className={textContainerStyles}>
          <InputText
            {...restProps}
            dxSize={dxSize}
            ref={targetRef}
            readOnly
            onFocus={handleFocus}
            className={classes(className)}
          />
          <div className="icon">
            <IconArrowDown dxSize={dxSize === "dense" ? 16 : 24} />
          </div>
        </div>
        <InputDropdownSelectProvider onSelect={handleSelect}>
          <div ref={popoverRef} className={classes(styles, { open: state.isOpen, close: state.isClosing })}>
            {children}
          </div>
        </InputDropdownSelectProvider>
      </div>
    );
  }
);
