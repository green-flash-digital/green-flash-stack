import type { JSX } from "react";
import { Suspense, forwardRef, lazy } from "react";

import type { IconNames } from "./buttery-icons.types.js";

export type IconComponentNative = JSX.IntrinsicElements["div"];
export type IconComponentCustom = {
  icon: IconNames;
  /**
   * The height and width of the icon in px, em or rem
   * @default inherit
   */
  ddSize?: string | number | "inherit";
};
export type IconComponent = IconComponentNative & IconComponentCustom;

export const IconComponent = forwardRef<HTMLDivElement, IconComponent>(
  function IconComponent(
    { children, className, icon, ddSize = "inherit", ...restProps },
    ref
  ) {
    const Icon = lazy(() => import(`./generated/${icon}.tsx`));

    return (
      <div
        {...restProps}
        className={className}
        style={{
          display: "grid",
          placeContent: "center",
          width: ddSize,
          height: ddSize,
          color: "inherit",
        }}
        ref={ref}
      >
        <Suspense fallback={<div>...</div>}>
          <Icon width="100%" height="100%" />
        </Suspense>
      </div>
    );
  }
);
