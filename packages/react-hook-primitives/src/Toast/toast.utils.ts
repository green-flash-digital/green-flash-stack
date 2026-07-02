import type { FC } from "react";

export const toastContainerId = "toast-container";

export function deCapitalizeFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export type ToastOptions = {
  closeToast: () => void;
};

export type ToastComponent<T extends Record<string, unknown>> = FC<
  T & ToastOptions
>;

export const getToasterOptionsMap = <T extends Record<string, unknown>>() => {
  if (!window.__rhp_toasts) {
    window.__rhp_toasts = new Map<string, T>();
  }
  return window.__rhp_toasts as Map<string, T>;
};

export const getToastOptions = <T extends Record<string, unknown>>(
  node: Node
): T & { id: string } => {
  const toastNode = node as HTMLElement;
  const toastId = toastNode.id;
  const optionsMap = getToasterOptionsMap<T>();
  const options = optionsMap.get(toastId);

  if (!options) {
    throw new Error(
      `Cannot find options for "${toastId}". This should not have happened. Please log an issue.`
    );
  }

  return {
    id: toastId,
    ...options,
  };
};

export const deleteToastOptions = <T extends Record<string, unknown>>(
  toastId: string
) => {
  const optionsMap = getToasterOptionsMap<T>();
  console.log("Deleting toast options", toastId);
  optionsMap.delete(toastId);
};

export const setToastOptions = <T>(
  options: T & { closeToast: () => void }
): string => {
  const optionsMap = getToasterOptionsMap();
  const toastId = window.crypto.randomUUID();

  optionsMap.set(toastId, options);
  return toastId;
};
