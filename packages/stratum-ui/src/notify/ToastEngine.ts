import { TransactionStore } from "@green-flash/reactor";
import { exhaustiveMatchGuard } from "@green-flash/ts-utils/isomorphic";

export type ToastProps = Record<string, unknown>;

export type ToastVariant = "info" | "success" | "warning" | "error" | "critical";

export type ToastInputBase = {
  message: string;
};

export type ToastState<T extends ToastProps = ToastProps> = ToastInputBase &
  T & { variant: ToastVariant; id: string };

export type ToastInput<T extends ToastProps = ToastProps> = ToastInputBase & T;

export type ToastOptions = {
  /**
   * The length of time in seconds that a toast is visible.
   */
  toastDuration?: number;
};

/**
 * Manages toast state and provides utility methods for toast presentation.
 *
 * This class encapsulates toast state and lifecycle, plus the ARIA attributes an
 * adapter needs to build its own accessible live regions — it does not render or
 * touch the DOM itself. Intended to be used by framework-specific adapters (e.g.
 * the React `Toaster`) that render the live regions and toast list declaratively.
 */
export class ToastEngine<T extends ToastProps = ToastProps> extends TransactionStore<
  ToastState<T>[]
> {
  #duration: number | undefined;

  static regionIds = {
    polite: "__STRATUM_TOAST_REGION_POLITE__",
    assertive: "__STRATUM_TOAST_REGION_ASSERTIVE__"
  };

  /**
   * Creates a new ToastEngine instance.
   *
   * @param options - Optional configuration for the toast engine.
   * @param options.toastDuration - The length of time in seconds that a toast is visible (default: undefined, meaning no auto-dismiss).
   */
  constructor(options?: ToastOptions) {
    super([]);
    this.#duration = options?.toastDuration;
  }

  /**
   * Converts a camelCase string to kebab-case.
   *
   * @param str - The camelCase string to convert.
   * @returns The kebab-case version of the input string.
   */
  #camelToKebab(str: string): string {
    return str
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // lower/num → Upper
      .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2") // split acronym boundaries
      .toLowerCase();
  }

  /**
   * Gets the ARIA region attributes for polite and assertive toast regions.
   * These attributes are used by an adapter to build its own accessible live
   * regions for screen readers — this class doesn't render anything itself.
   *
   * @param options - Optional configuration.
   * @param options.toKebabCase - If true, converts attribute keys to kebab-case (e.g., "ariaLive" becomes "aria-live").
   * @returns An object containing polite and assertive region attributes.
   */
  getRegionAttributes(options?: { toKebabCase?: boolean }) {
    const toKebabCase = options?.toKebabCase ?? false;
    const polite = {
      id: ToastEngine.regionIds.polite,
      role: "status",
      ariaLive: "polite",
      ariaAtomic: "true",
      ariaRelevant: "additions text"
    };

    const assertive = {
      id: ToastEngine.regionIds.assertive,
      role: "alert",
      ariaLive: "assertive",
      ariaAtomic: "true",
      ariaRelevant: "additions text"
    };

    if (!toKebabCase) return { polite, assertive };

    const camelToKebabObj = <T extends Record<string, string>>(obj: T) => {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [this.#camelToKebab(key), value])
      );
    };

    return {
      polite: camelToKebabObj(polite),
      assertive: camelToKebabObj(assertive)
    };
  }

  /**
   * Determines the ARIA live region type (polite or assertive) based on the toast variant.
   * Critical and error toasts use assertive regions, while info, warning, and success toasts use polite regions.
   */
  getToastType(toast: ToastState<T>) {
    switch (toast.variant) {
      case "critical":
      case "error":
        return "assertive";

      case "info":
      case "warning":
      case "success":
        return "polite";

      default:
        return exhaustiveMatchGuard(toast.variant);
    }
  }

  /**
   * Displays an info toast notification.
   * Info toasts use the polite ARIA live region and will auto-dismiss if a duration is configured.
   */
  info(state: ToastInput<T>) {
    this.#add({ variant: "info", ...state });
  }

  /**
   * Displays a success toast notification.
   * Success toasts use the polite ARIA live region and will auto-dismiss if a duration is configured.
   */
  success(state: ToastInput<T>) {
    this.#add({ variant: "success", ...state });
  }

  /**
   * Displays a warning toast notification.
   * Warning toasts use the polite ARIA live region and will auto-dismiss if a duration is configured.
   */
  warning(state: ToastInput<T>) {
    this.#add({ variant: "warning", ...state });
  }

  /**
   * Displays an error toast notification.
   * Error toasts use the assertive ARIA live region and do not auto-dismiss.
   */
  error(state: ToastInput<T>) {
    this.#add({ variant: "error", ...state }, { autoDismiss: false });
  }

  /**
   * Displays a critical toast notification.
   * Critical toasts use the assertive ARIA live region and do not auto-dismiss.
   */
  critical(state: ToastInput<T>) {
    this.#add({ variant: "critical", ...state }, { autoDismiss: false });
  }

  /**
   * Adds a new toast to the state.
   */
  #add(toast: ToastInput<T>, options?: { autoDismiss?: boolean }): void {
    const autoDismiss = options?.autoDismiss ?? true;
    const id = window.crypto.randomUUID();
    this.enqueue({
      mutate: (draft) => {
        draft.push({ id, ...toast } as (typeof draft)[number]);
      },
      notify: true
    });

    if (!this.#duration || !autoDismiss) return;
    setTimeout(() => {
      this.remove(id);
    }, this.#duration * 1_000);
  }

  /**
   * Removes a toast by index.
   */
  remove(id: string): void {
    this.enqueue({
      mutate: (draft) => {
        const index = draft.findIndex((toast) => toast.id === id);
        draft.splice(index, 1);
      }
    });
  }

  /**
   * Removes all toasts.
   */
  clear(): void {
    this.enqueue({
      mutate: (draft) => {
        draft.length = 0;
      }
    });
  }
}
