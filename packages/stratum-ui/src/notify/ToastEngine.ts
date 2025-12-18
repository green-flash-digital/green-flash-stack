import { TransactionStore } from "@green-flash/reactor";
import { exhaustiveMatchGuard } from "@green-flash/ts-utils/isomorphic";

export type ToastProps = Record<string, unknown>;

export type ToastVariant =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "critical";

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
 * This class encapsulates toast state management, toast lifecycle, and region attributes
 * for accessibility (like ARIA live regions) but does not directly perform any DOM rendering.
 * Intended to be used by framework-specific adapters (e.g., React Toaster) to render and manage toasts
 * in the UI.
 */
export class ToastEngine<
  T extends ToastProps = ToastProps
> extends TransactionStore<ToastState<T>[]> {
  #container: HTMLElement | undefined;
  #regionPolite: HTMLElement | undefined;
  #regionAssertive: HTMLElement | undefined;
  #duration: number | undefined;

  static regionIds = {
    polite: "__STRATUM_TOAST_REGION_POLITE__",
    assertive: "__STRATUM_TOAST_REGION_ASSERTIVE__",
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
   * Gets the container element where toast regions will be appended.
   * If no container is set, defaults to document.body.
   *
   * @returns The container HTMLElement.
   */
  #getContainer() {
    if (!this.#container) {
      this.#container = document.body;
    }
    return this.#container;
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
   * These attributes are used to create accessible live regions for screen readers.
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
      ariaRelevant: "additions text",
    };

    const assertive = {
      id: ToastEngine.regionIds.assertive,
      role: "alert",
      ariaLive: "assertive",
      ariaAtomic: "true",
      ariaRelevant: "additions text",
    };

    if (!toKebabCase) return { polite, assertive };

    const camelToKebabObj = <T extends Record<string, string>>(obj: T) => {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          this.#camelToKebab(key),
          value,
        ])
      );
    };

    return {
      polite: camelToKebabObj(polite),
      assertive: camelToKebabObj(assertive),
    };
  }

  /**
   * Ensures the polite ARIA live region exists in the DOM.
   * If it doesn't exist, creates and appends it to the container.
   * Optionally adds a CSS class to the region.
   *
   * @param className - Optional CSS class name to add to the region element.
   * @returns The polite region HTMLElement.
   */
  ensureRegionPolite(className?: string) {
    if (!this.#regionPolite) {
      this.#regionPolite =
        document.getElementById(ToastEngine.regionIds.polite) ?? undefined;
    }
    if (!this.#regionPolite) {
      const el = document.createElement("div");
      const attributes = this.getRegionAttributes().polite;
      for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
      }
      this.#regionPolite = el;

      const container = this.#getContainer();
      container.appendChild(this.#regionPolite);
    }
    if (className && !this.#regionPolite.classList.contains(className)) {
      this.#regionPolite.classList.add(className);
    }
    return this.#regionPolite;
  }

  /**
   * Ensures the assertive ARIA live region exists in the DOM.
   * If it doesn't exist, creates and appends it to the container.
   * Optionally adds a CSS class to the region.
   *
   * @param className - Optional CSS class name to add to the region element.
   * @returns The assertive region HTMLElement.
   */
  ensureRegionAssertive(className?: string) {
    if (!this.#regionAssertive) {
      this.#regionAssertive =
        document.getElementById(ToastEngine.regionIds.assertive) ?? undefined;
    }
    if (!this.#regionAssertive) {
      const el = document.createElement("div");
      const attributes = this.getRegionAttributes().assertive;
      for (const [key, value] of Object.entries(attributes)) {
        el.setAttribute(key, value);
      }
      this.#regionAssertive = el;

      const container = this.#getContainer();
      container.appendChild(this.#regionAssertive);
    }
    if (className && !this.#regionAssertive.classList.contains(className)) {
      this.#regionAssertive.classList.add(className);
    }
    return this.#regionAssertive;
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
    this.ensureRegionPolite();
    this.#add({ variant: "info", ...state });
  }

  /**
   * Displays a success toast notification.
   * Success toasts use the polite ARIA live region and will auto-dismiss if a duration is configured.
   */
  success(state: ToastInput<T>) {
    this.ensureRegionPolite();
    this.#add({ variant: "success", ...state });
  }

  /**
   * Displays a warning toast notification.
   * Warning toasts use the polite ARIA live region and will auto-dismiss if a duration is configured.
   */
  warning(state: ToastInput<T>) {
    this.ensureRegionPolite();
    this.#add({ variant: "warning", ...state });
  }

  /**
   * Displays an error toast notification.
   * Error toasts use the assertive ARIA live region and do not auto-dismiss.
   */
  error(state: ToastInput<T>) {
    this.ensureRegionAssertive();
    this.#add({ variant: "error", ...state }, { autoDismiss: false });
  }

  /**
   * Displays a critical toast notification.
   * Critical toasts use the assertive ARIA live region and do not auto-dismiss.
   */
  critical(state: ToastInput<T>) {
    this.ensureRegionAssertive();
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
      notify: true,
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
      },
    });
  }

  /**
   * Removes all toasts.
   */
  clear(): void {
    this.enqueue({
      mutate: (draft) => {
        draft.length = 0;
      },
    });
  }

  /**
   * Destroys the toast instance and removes the region from the DOM.
   */
  destroy(): void {
    if (this.#regionPolite?.parentNode) {
      this.#regionPolite.parentNode.removeChild(this.#regionPolite);
    }
    if (this.#regionAssertive?.parentNode) {
      this.#regionAssertive.parentNode.removeChild(this.#regionAssertive);
    }
  }
}
