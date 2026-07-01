import { type JSX, type RefCallback, useCallback, useId } from "react";
import { classes } from "react-hook-primitives";

import type { ModalState } from "./Modal.engine";
import { ModalProvider, type ModalProviderProps } from "./Modal.provider";
import { modalBaseStyles, modalStyles } from "./Modal.styles";

export type ModalType = "default" | "drawer";
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export type ModalProps<S extends ModalState> = ModalProviderProps<S> &
  JSX.IntrinsicElements["dialog"] & {
    dxSize?: ModalSize;
  } & (
    | {
        /**
         * The kind of styling treatment that should be applied
         * @default 'default'
         */
        dxType?: Extract<ModalType, "default">;
        /**
         * How the content is laid out in the modal
         */
        dxLayout?: "contain" | "flow";
      }
    | {
        dxType?: Extract<ModalType, "drawer">;
        dxVariant: "right";
      }
  );

export function Modal<S extends ModalState>({
  children,
  dxEngine,
  dxOnMount,
  className,
  dxSize = "sm",
  ...props
}: ModalProps<S>) {
  const id = useId();

  const handleOnMount = useCallback<RefCallback<HTMLDialogElement>>(
    (node) => {
      if (dxOnMount) dxOnMount(node);
      dxEngine.onMount(node);
    },
    [dxEngine, dxOnMount]
  );

  return (
    <ModalProvider<S> dxEngine={dxEngine}>
      <dialog
        id={id}
        ref={handleOnMount}
        className={classes(
          modalBaseStyles,
          modalStyles[props.dxType ?? "default"],
          { [`s-${dxSize}`]: dxSize },
          props.dxType === "default" && {
            [`v-${props.dxLayout}`]: props.dxLayout
          },
          props.dxType === "drawer" && {
            [`v-${props.dxVariant}`]: props.dxVariant
          },
          className
        )}
      >
        {children}
      </dialog>
    </ModalProvider>
  );
}
