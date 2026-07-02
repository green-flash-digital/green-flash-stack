import type { ChangeEventHandler, JSX } from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { useForwardedRef } from "react-hook-primitives";

import {
  makeSpace,
  makeColor,
  makeFontFamily,
  makeRem,
  makeReset
} from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { InputNumber } from "./InputNumber";

export type InputRangePropsNative = Omit<JSX.IntrinsicElements["input"], "type" | "min" | "max">;
export type InputRangePropsCustom = {
  min: number;
  max: number;
  dxDisplayMax?: boolean;
  dxDisplayMin?: boolean;
  dxDisplayInput?: boolean;
  dxDisplayTooltip?: boolean;
  dxVariant?: "normal" | "hue";
  value?: number;
  /**
   * Custom handler that has the value of the range
   * passed as a parameter
   */
  dxOnChange?: (value: number) => void;
};
export type InputRangeProps = InputRangePropsNative & InputRangePropsCustom;

const containerStyles = css`
  display: flex;
  align-items: center;
  gap: ${makeSpace(16)};
  width: 100%;
  font-family: ${makeFontFamily("mulish")};

  .range-label {
    font-size: ${makeRem(14)};
    color: ${makeColor("neutral", { opacity: 0.8 })};
  }

  .manual-input {
    width: ${makeRem(50)};
    text-align: center;
  }
`;

const inputRangeStyles = css`
  --thumb-bg: white;
  --thumb-size: ${makeRem(14)};
  --thumb-border: ${makeRem(1)} solid ${makeColor("neutral-dark", { opacity: 0.2 })};
  --thumb-offset: calc(calc(var(--thumb-size) / 4) * -1);

  --track-height: calc(var(--thumb-size) / 2);
  &.v-normal {
    --track-bg: ${`linear-gradient(
    to right,
    ${makeColor("primary")} 0%, 
    ${makeColor("primary")} var(--percentage),
    ${makeColor("neutral-dark", { opacity: 0.02 })} var(--percentage),
    ${makeColor("neutral-dark", { opacity: 0.02 })} 100%)`};
  }

  &.v-hue {
    --track-bg: linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red);
  }

  --track-border-radius: ${makeSpace(4)};

  --shadow-color: 0deg 0% 0%;
  --shadow-elevation-low:
    0.3px 0.2px 0.4px hsl(var(--shadow-color) / 0.12),
    0.5px 0.4px 0.7px -1.2px hsl(var(--shadow-color) / 0.13),
    1.2px 0.9px 1.7px -2.3px hsl(var(--shadow-color) / 0.13);
  --shadow-elevation-medium:
    0.3px 0.2px 0.4px hsl(var(--shadow-color) / 0.13),
    1px 0.7px 1.4px -0.8px hsl(var(--shadow-color) / 0.13),
    2.5px 1.9px 3.6px -1.6px hsl(var(--shadow-color) / 0.14),
    6px 4.5px 8.6px -2.3px hsl(var(--shadow-color) / 0.14);
  --shadow-elevation-high:
    0.3px 0.2px 0.4px hsl(var(--shadow-color) / 0.14),
    2.2px 1.7px 3.2px -0.4px hsl(var(--shadow-color) / 0.14),
    4.4px 3.3px 6.3px -0.8px hsl(var(--shadow-color) / 0.14),
    7.7px 5.8px 11.1px -1.2px hsl(var(--shadow-color) / 0.14),
    13px 9.8px 18.7px -1.6px hsl(var(--shadow-color) / 0.15),
    21.2px 16px 30.5px -2px hsl(var(--shadow-color) / 0.15),
    33.3px 25.1px 47.9px -2.3px hsl(var(--shadow-color) / 0.15);

  width: 100%;
  box-shadow: none;

  ${makeReset("input")};

  &::-webkit-slider-runnable-track {
    height: var(--track-height);
    border-radius: var(--track-border-radius);
    background: var(--track-bg);
  }

  &::-moz-range-track {
    background: var(--track-bg);
    height: var(--track-height);
    background: var(--track-bg);
  }

  &::-ms-track {
    background: transparent;
    border-color: transparent;
    color: transparent;
    height: var(--track-height);
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    background: var(--thumb-bg);
    border: var(--thumb-border);
    width: var(--thumb-size);
    height: var(--thumb-size);
    box-shadow: var(--shadow-elevation-low);
    border-radius: 50%;
    margin-top: var(--thumb-offset);
    cursor: pointer;
    transition: all 0.1s ease-in-out;

    &:hover {
      box-shadow: var(--shadow-elevation-medium);
      border-color: ${makeColor("primary-100")};
    }

    &:active {
      box-shadow: var(--shadow-elevation-high);
      border-color: ${makeColor("primary-100")};
    }
  }

  &::-moz-range-thumb {
    background: var(--thumb-bg);
    width: var(--thumb-size);
    height: var(--thumb-size);
    box-shadow: var(--shadow-elevation-low);
    border-radius: 50%;
    cursor: pointer;
  }

  &::-ms-thumb {
    background: var(--thumb-bg);
    width: var(--thumb-size);
    height: var(--thumb-size);
    box-shadow: var(--shadow-elevation-medium);
    border-radius: 50%;
    cursor: pointer;
  }

  &::-ms-fill-lower {
    background: var(--track-bg);
  }

  &::-ms-fill-upper {
    background: var(--track-bg);
  }

  &:focus {
    outline: none;
  }
`;

function calculatePercentage(value: number, min: number, max: number) {
  const raw = ((value - min) / (max - min)) * 100;
  return {
    raw,
    percent: `${raw}%`
  };
}

export const InputRange = forwardRef<HTMLInputElement, InputRangeProps>(function InputRange(
  {
    min,
    max,
    dxDisplayMin,
    dxDisplayMax,
    dxDisplayInput,
    dxDisplayTooltip,
    dxVariant = "normal",
    dxOnChange,
    className,
    value,
    ...restProps
  },
  forwardedRef
) {
  const inputRangeRef = useForwardedRef(forwardedRef);
  const inputNumberRef = useRef<HTMLInputElement | null>(null);
  const [localValue, setLocalValue] = useState(value ?? 0);

  // If the input is controlled, we need to update
  // our local state if the controlled value changes
  useEffect(() => {
    if (!value) return;
    setLocalValue(value);
  }, [value]);

  const handleOnChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const value = Number(e.currentTarget.value);
      setLocalValue(Number(value));
      if (dxOnChange) dxOnChange(value);
    },
    [dxOnChange]
  );

  return (
    <div className={classes(containerStyles)}>
      {dxDisplayMin && <span className="range-label">{min}</span>}
      <input
        {...restProps}
        min={min}
        max={max}
        type="range"
        className={classes(
          inputRangeStyles,
          {
            [`v-${dxVariant}`]: dxVariant
          },
          className
        )}
        value={localValue}
        style={{
          // @ts-expect-error Custom properties are allowed but cannot be recognized by the compiler
          "--percentage": calculatePercentage(localValue, min, max).percent
        }}
        onInput={handleOnChange}
        ref={inputRangeRef}
      />
      {dxDisplayMax && <span className="range-label">{max}</span>}
      {dxDisplayInput && (
        <InputNumber
          ref={inputNumberRef}
          dxSize="dense"
          min={min}
          max={max}
          value={localValue}
          className="manual-input"
          onChange={handleOnChange}
        />
      )}
    </div>
  );
});
