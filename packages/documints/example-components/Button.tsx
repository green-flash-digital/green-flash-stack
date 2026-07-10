import { classes } from "@buttery/components";
import { css } from "@linaria/core";
import type { JSX } from "react";
import { forwardRef } from "react";

export type ButtonPropsNative = JSX.IntrinsicElements["button"];
export type ButtonPropsCustom = {
  dxVariant: "primary" | "secondary";
};
export type ButtonProps = ButtonPropsNative & ButtonPropsCustom;

const buttonStyles = css`
  &.primary {
    background-color: blue;
    color: white;
  }
  &.secondary {
    background-color: purple;
    color: white;
  }
`;

/**
 * An example component to display how the buttery docs vite plugin system
 * works
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ children, className, ...restProps }, ref) {
    return (
      <button
        {...restProps}
        className={classes(buttonStyles, className)}
        ref={ref}
      >
        {children}
      </button>
    );
  }
);
