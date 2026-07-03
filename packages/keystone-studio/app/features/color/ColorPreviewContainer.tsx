import type { JSX } from "react";
import { forwardRef } from "react";

import { classes } from "@green-flash/ts-utils/isomorphic";

export type ColorPreviewContainerPropsNative = JSX.IntrinsicElements["div"];
export type ColorPreviewContainerPropsCustom = {
  dxTitle?: string;
};
export type ColorPreviewContainerProps = ColorPreviewContainerPropsNative &
  ColorPreviewContainerPropsCustom;

export const ColorPreviewContainer = forwardRef<HTMLDivElement, ColorPreviewContainerProps>(
  function ColorPreviewContainer({ children, className, ...restProps }, ref) {
    return (
      <div {...restProps} className={classes(className)} ref={ref}>
        {children}
      </div>
    );
  }
);
