import { useCallback, useMemo } from "react";

import { setToastOptions, toastContainerId } from "./toast.utils.js";

export const useToast = <
  ToastOptions extends Record<string, unknown>
>(params?: {
  /**
   * An optional ID that should be supplied to the toaster and this hook
   * to customize what container the toasts get mounted to. This should be used
   * when you have multiple instances of the <Toaster /> component in your app.
   */
  id?: string;
  /**
   * The number of `seconds` that the toast will remain open
   * before closing. A value of false will disable the auto
   * close functionality and the toasts will persist until they
   * are manually closed.
   * @default 4
   */
  autoClose?: number | false;
}) => {
  const create = useCallback<(options: ToastOptions) => void>(
    (options) => {
      if (typeof window === "undefined") return;
      const autoClose = params?.autoClose || 4;
      const toasterId = params?.id ?? toastContainerId;
      const toastContainer = document.querySelector(`#${toasterId}`);
      if (!toastContainer && params?.id) {
        console.error(
          `Cannot find the Toaster ID of "${params.id}" in the DOM. Please ensure that you have added the <Toaster /> component and supplied the id="${params.id}"' prop to it anywhere in the React tree.`
        );
        return;
      }
      if (!toastContainer) {
        console.error(
          "Cannot find the Toaster ID in the DOM. Please ensure that you add the <Toaster /> component anywhere in the React tree."
        );
        return;
      }

      const toast = document.createElement("article");

      function removeToast() {
        console.log("Removing toast node");
        toast.remove();
      }

      // set the toast options to a window context
      const toastId = setToastOptions({
        ...options,
        closeToast: removeToast,
      });
      toast.setAttribute("id", toastId);
      toastContainer.appendChild(toast);

      // add a timeout if autoclose is enabled
      if (autoClose) {
        setTimeout(() => {
          removeToast();
        }, autoClose * 1_000);
      }
    },
    [params?.id, params?.autoClose]
  );

  return useMemo(
    () => ({
      create,
    }),
    [create]
  );
};
