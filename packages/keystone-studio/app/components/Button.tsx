import { forwardRef } from "react";

import { exhaustiveMatchGuard } from "@green-flash/ts-utils/isomorphic";

import type { ButtonIconProps } from "./ButtonIcon";
import { ButtonIcon } from "./ButtonIcon";
import { ButtonRegular, type ButtonRegularProps } from "./ButtonRegular";

export type ButtonPropsCustom = ButtonRegularProps | ButtonIconProps;
export type ButtonProps = ButtonPropsCustom;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  switch (props.dxVariant) {
    case "contained":
    case "outlined":
    case "text":
      return <ButtonRegular ref={ref} {...props} />;

    case "icon":
      return <ButtonIcon ref={ref} {...props} />;

    default:
      return exhaustiveMatchGuard(props);
  }
});
