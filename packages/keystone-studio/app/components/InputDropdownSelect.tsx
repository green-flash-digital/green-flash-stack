import type { JSX } from "react";
import { forwardRef, useCallback } from "react";
import {
  classes,
  type DropdownOptions,
  useDropdownInput,
  useForwardedRef
} from "react-hook-primitives";

import { makeSpace, makeColor, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { IconArrowDown } from "~/icons/IconArrowDown";

import { InputDropdownSelectProvider } from "./InputDropdownSelect.context";
import type { InputTextPropsCustom } from "./InputText";
import { InputText } from "./InputText";

export type InputDropdownSelectPropsNative = JSX.IntrinsicElements["input"];
export type InputDropdownSelectPropsCustom = DropdownOptions &
  InputTextPropsCustom & { dxOnSelect: (value: string) => void };
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
    { children, className, dxArrow, dxOffset, dxPosition, dxSize, dxOnSelect, ...restProps },
    ref
  ) {
    const forwardedRef = useForwardedRef(ref);

    const { isOpen, containerRef, setInputMenuRef, setTargetRef, targetRef, closeInputMenu } =
      useDropdownInput({
        dxArrow,
        dxOffset,
        dxPosition,
        forwardedRef
      });

    const handleSelect = useCallback<(value: string) => void>(
      (value) => {
        if (!targetRef.current) return;
        targetRef.current.value = value;
        if (dxOnSelect) dxOnSelect(value);
        closeInputMenu();
      },
      [closeInputMenu, dxOnSelect, targetRef]
    );

    return (
      <div ref={containerRef}>
        <div className={textContainerStyles}>
          <InputText
            {...restProps}
            dxSize={dxSize}
            ref={setTargetRef}
            readOnly
            className={classes(className)}
          />
          <div className="icon">
            <IconArrowDown dxSize={dxSize === "dense" ? 16 : 24} />
          </div>
        </div>
        <InputDropdownSelectProvider onSelect={handleSelect}>
          {isOpen && (
            <div ref={setInputMenuRef} className={styles}>
              {children}
            </div>
          )}
        </InputDropdownSelectProvider>
      </div>
    );
  }
);
