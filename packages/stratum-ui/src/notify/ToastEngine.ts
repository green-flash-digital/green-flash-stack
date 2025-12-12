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
 * Manages toast state and creates static toast region containers.
 *
 * The toast regions are created once when the Toast instance is constructed,
 * providing a framework-agnostic container that adapters (like React) can
 * render toast content into.
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

  constructor(options?: ToastOptions) {
    super([]);
    this.#duration = options?.toastDuration;
  }

  #getContainer() {
    if (!this.#container) {
      this.#container = document.body;
    }
    return this.#container;
  }

  getRegionPolite() {
    if (!this.#regionPolite) {
      const el = document.createElement("div");
      el.id = ToastEngine.regionIds.polite;
      el.ariaLive = "polite";
      el.ariaAtomic = "false";
      this.#regionPolite = el;

      const container = this.#getContainer();
      container.appendChild(this.#regionPolite);
    }
    return this.#regionPolite;
  }

  getRegionAssertive() {
    if (!this.#regionAssertive) {
      const el = document.createElement("div");
      el.id = ToastEngine.regionIds.assertive;
      el.ariaLive = "assertive";
      el.ariaAtomic = "true";
      this.#regionAssertive = el;

      const container = this.#getContainer();
      container.appendChild(this.#regionAssertive);
    }
    return this.#regionAssertive;
  }

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

  info(state: ToastInput<T>) {
    this.getRegionPolite();
    this.#add({ variant: "info", ...state });
  }

  success(state: ToastInput<T>) {
    this.getRegionPolite();
    this.#add({ variant: "success", ...state });
  }

  warning(state: ToastInput<T>) {
    this.getRegionPolite();
    this.#add({ variant: "warning", ...state });
  }

  error(state: ToastInput<T>) {
    this.getRegionAssertive();
    this.#add({ variant: "error", ...state });
  }

  critical(state: ToastInput<T>) {
    this.getRegionAssertive();
    this.#add({ variant: "critical", ...state });
  }

  /**
   * Adds a new toast to the state.
   */
  #add(toast: ToastInput<T>): void {
    const id = window.crypto.randomUUID();
    this.enqueue({
      mutate: (draft) => {
        draft.push({ id, ...toast } as (typeof draft)[number]);
      },
    });

    if (!this.#duration) return;
    setTimeout(() => {
      this.remove(id);
    }, this.#duration);
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
