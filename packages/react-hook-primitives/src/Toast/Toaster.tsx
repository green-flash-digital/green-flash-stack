import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Toast } from "./Toast.js";
import {
  type ToastComponent,
  type ToastOptions,
  deleteToastOptions,
  getToastOptions,
  toastContainerId,
} from "./toast.utils.js";

export function Toaster<
  ToastComponentProps extends { [key: string]: unknown }
>({
  ToastComponent,
  id,
}: {
  ToastComponent: ToastComponent<ToastComponentProps>;
  /**
   * The ID of the toaster where the toasts will be added. A mutation observer
   */
  id?: string;
}) {
  const [toasts, setToasts] = useState<{
    [key: string]: ToastComponentProps & ToastOptions;
  }>({});
  const mutationObserverRef = useRef<MutationObserver | undefined>(undefined);
  const toasterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !toasterRef.current) return;

    // disconnect when the toaster mounts.
    const callback: MutationCallback = (mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type !== "childList") return;

        if (mutation.addedNodes.length) {
          for (const addedNode of mutation.addedNodes) {
            const toastProps = getToastOptions<
              ToastComponentProps & ToastOptions
            >(addedNode);
            setToasts((prevState) => ({
              ...prevState,
              [toastProps.id]: toastProps,
            }));
          }
        }
        if (mutation.removedNodes.length) {
          for (const removedNode of mutation.removedNodes) {
            const toastProps = getToastOptions(removedNode);
            setToasts((prevState) => {
              const { [toastProps.id]: deletedToast, ...restState } = prevState;
              deleteToastOptions(toastProps.id);
              return restState;
            });
          }
        }
      }
    };

    mutationObserverRef.current = new MutationObserver(callback);
    console.log("Connecting mutation observer");
    mutationObserverRef.current.observe(toasterRef.current, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    // disconnect when the toaster is removed.
    return () => {
      console.log("Disconnecting mutation observer");
      mutationObserverRef.current?.disconnect();
    };
  }, []);

  return (
    <>
      <div
        id={id ?? toastContainerId}
        style={{ display: "none" }}
        ref={toasterRef}
      />
      {Object.values(toasts).length > 0 &&
        createPortal(
          Object.entries(toasts).map(([id, toastProps]) => {
            return (
              <Toast key={id} id={id}>
                <ToastComponent {...toastProps} />
              </Toast>
            );
          }),
          document.body
        )}
    </>
  );
}
