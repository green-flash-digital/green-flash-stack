import type { JSX } from "react";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef } from "react";
import { classes } from "@green-flash/ts-utils/isomorphic";

import { makeSpace, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

export type ColorBlobPropsNative = Omit<JSX.IntrinsicElements["div"], "children">;
export type ColorBlobPropsCustom = {
  dxVariant: "square" | "circle";
} & ({ dxType: "hue"; dxValue: number } | { dxType: "hex"; dxValue: string });
export type ColorBlobProps = ColorBlobPropsNative & ColorBlobPropsCustom;
export type ColorBlobRef = {
  setHue: (value: number) => void;
  setHex: (value: string) => void;
};

const styles = css`
  height: 100%;
  aspect-ratio: 1 / 1;

  &.square {
    border-radius: ${makeSpace(4)};
  }
  &.circle {
    border-radius: 50%;
  }

  &.hue {
    background: hsl(var(--hue), 100%, 50%);
  }
  &.hex {
    background: var(--hex);
  }
`;

export const ColorBlob = forwardRef<ColorBlobRef, ColorBlobProps>(function ColorBlob(props, ref) {
  const colorRef = useRef<HTMLDivElement | null>(null);

  useImperativeHandle(ref, () => ({
    setHue: (value) => {
      if (!colorRef.current) return;
      colorRef.current.style.setProperty("--hue", value.toString());
    },
    setHex: (value) => {
      if (!colorRef.current) return;
      colorRef.current.style.setProperty("--hex", value.toString());
    }
  }));

  const { className, dxType: _, dxVariant: __, dxValue: ___, ...restProps } = props;

  return (
    <div
      {...restProps}
      className={classes(styles, className, props.dxType, props.dxVariant)}
      style={
        props.dxType === "hex"
          ? // @ts-expect-error setting custom properties is valid
            { ["--hex"]: props.dxValue }
          : { ["--hue"]: props.dxValue }
      }
      ref={colorRef}
    />
  );
});

export const useColorBlob = () => {
  const colorBlobRef = useRef<ColorBlobRef | null>(null);

  const setHue = useCallback<ColorBlobRef["setHue"]>((value) => {
    if (!colorBlobRef.current) return;
    colorBlobRef.current.setHue(value);
  }, []);

  const setHex = useCallback<ColorBlobRef["setHex"]>((value) => {
    if (!colorBlobRef.current) return;
    colorBlobRef.current.setHex(value);
  }, []);

  return useMemo(() => ({ colorBlobRef, setHue, setHex }), [setHex, setHue]);
};
