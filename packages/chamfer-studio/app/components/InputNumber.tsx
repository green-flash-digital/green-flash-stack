import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";

import { InputText, type InputTextPropsCustom } from "./InputText";

export type InputNumberPropsNative = JSX.IntrinsicElements["input"];
export type InputNumberPropsCustom = Omit<InputTextPropsCustom, "dxType">;
export type InputNumberProps = InputNumberPropsNative & InputNumberPropsCustom;

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(function InputNumber(
  { children, className, ...restProps },
  ref
) {
  return (
    <InputText {...restProps} className={classes(className)} dxType="number" ref={ref}>
      {children}
    </InputText>
  );
});
