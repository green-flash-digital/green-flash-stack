import { forwardRef, useCallback } from "react";

import { makeSpace, makeRem } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { ColorBlob, useColorBlob } from "./ColorBlob";
import type { InputRangePropsNative } from "./InputRange";
import { InputRange } from "./InputRange";

export type InputHuePropsNative = InputRangePropsNative & {
  value?: number;
  dxOnChange?: (value: number) => void;
};
export type InputHueProps = InputHuePropsNative;

const styles = css`
  display: grid;
  grid-template-columns: ${makeSpace(24)} 1fr;
  gap: ${makeSpace(16)};
  align-items: center;
  width: 100%;
`;

export const InputHue = forwardRef<HTMLInputElement, InputHueProps>(function InputHue(
  { children, className, value, dxOnChange, ...restProps },
  ref
) {
  const { colorBlobRef, setHue } = useColorBlob();

  const handleChange = useCallback(
    (newValue: number) => {
      setHue(newValue);
      dxOnChange?.(newValue);
    },
    [setHue, dxOnChange]
  );

  return (
    <div className={styles}>
      <ColorBlob ref={colorBlobRef} dxVariant="square" dxType="hue" dxValue={Number(value)} />
      <InputRange
        dxDisplayInput
        dxVariant="hue"
        min={0}
        max={360}
        ref={ref}
        dxOnChange={handleChange}
        value={value}
        {...restProps}
      />
    </div>
  );
});
