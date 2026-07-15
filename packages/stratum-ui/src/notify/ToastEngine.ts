import { TransactionStore } from "@green-flash/reactor";
import { exhaustiveMatchGuard } from "@green-flash/ts-utils/isomorphic";

export type ToastProps = Record<string, unknown>;

export type ToastVariant = "info" | "success" | "warning" | "error" | "critical";

export type ToastInputBase = {
  message: string;
};

export type ToastState<T extends ToastProps = ToastProps> = ToastInputBase &
  T & {
    variant: ToastVariant;
    id: string;
    /**
     * The auto-dismiss duration in seconds this toast was created with, or
     * `undefined` if it doesn't auto-dismiss (e.g. `error`/`critical`, or no
     * `toastDuration` configured). Exposed so an adapter's toast component can
     * render a countdown/progress affordance — it's static (the original
     * configured value), not a live countdown; `pause()`/`resume()` affect the
     * actual dismiss timer, not this value.
     */
    duration: number | undefined;
  };

export type ToastInput<T extends ToastProps = ToastProps> = ToastInputBase & T;

export type ToastOptions = {
  /**
   * The length of time in seconds that a toast is visible.
   */
  toastDuration?: number;
};

type TimerEntry = {
  /** `null` while paused — no timer is currently running for this toast. */
  timeoutId: ReturnType<typeof setTimeout> | null;
  remainingMs: number;
  startedAt: number;
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
  #timers = new Map<string, TimerEntry>();

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
   * The adapter rendering these must keep the region elements themselves
   * persistently mounted (present, even empty) from the start — assistive
   * tech only reliably announces content added to an *already-present* live
   * region in a separate step, not a region and its content appearing
   * together. It also must never hide/detach the region element itself while
   * adding content to it (e.g. for unrelated z-index/stacking purposes) —
   * that risks the announcement being missed the same way.
   *
   * `aria-atomic` is deliberately `"false"`: with `"true"`, every new toast
   * would re-announce the full region, including any older toasts still
   * present and already announced. `role="alert"` intentionally omits an
   * explicit `aria-live="assertive"` — the role already implies it, and
   * setting both is a documented cause of double-speaking in VoiceOver on
   * iOS. `role="status"` keeps its redundant `aria-live="polite"`, which MDN
   * recommends for that role specifically, for compatibility.
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
      ariaAtomic: "false",
      ariaRelevant: "additions"
    };

    const assertive = {
      id: ToastEngine.regionIds.assertive,
      role: "alert",
      ariaAtomic: "false",
      ariaRelevant: "additions"
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
    const duration = autoDismiss ? this.#duration : undefined;
    this.enqueue({
      mutate: (draft) => {
        draft.push({ id, duration, ...toast } as (typeof draft)[number]);
      },
      notify: true
    });

    if (!duration) return;
    this.#startTimer(id, duration * 1_000);
  }

  #startTimer(id: string, remainingMs: number) {
    const startedAt = Date.now();
    const timeoutId = setTimeout(() => {
      this.#timers.delete(id);
      this.remove(id);
    }, remainingMs);
    this.#timers.set(id, { timeoutId, remainingMs, startedAt });
  }

  #clearTimer(id: string) {
    const timer = this.#timers.get(id);
    if (timer?.timeoutId) clearTimeout(timer.timeoutId);
    this.#timers.delete(id);
  }

  /**
   * Pauses a toast's auto-dismiss timer — e.g. call on `onMouseEnter`, so a
   * toast doesn't disappear out from under someone still reading it. No-op if
   * the toast doesn't auto-dismiss, or is already paused.
   */
  pause(id: string) {
    const timer = this.#timers.get(id);
    if (!timer?.timeoutId) return;
    clearTimeout(timer.timeoutId);
    const elapsed = Date.now() - timer.startedAt;
    this.#timers.set(id, {
      timeoutId: null,
      remainingMs: Math.max(0, timer.remainingMs - elapsed),
      startedAt: timer.startedAt
    });
  }

  /**
   * Resumes a paused toast's auto-dismiss timer for whatever time was
   * remaining when it was paused — e.g. call on `onMouseLeave`. No-op if the
   * toast isn't currently paused.
   */
  resume(id: string) {
    const timer = this.#timers.get(id);
    if (!timer || timer.timeoutId) return;
    this.#startTimer(id, timer.remainingMs);
  }

  /**
   * Removes a toast by id.
   */
  remove(id: string): void {
    this.#clearTimer(id);
    this.enqueue({
      mutate: (draft) => {
        const index = draft.findIndex((toast) => toast.id === id);
        if (index === -1) return;
        draft.splice(index, 1);
      }
    });
  }

  /**
   * Removes all toasts.
   */
  clear(): void {
    for (const id of [...this.#timers.keys()]) this.#clearTimer(id);
    this.enqueue({
      mutate: (draft) => {
        draft.length = 0;
      }
    });
  }
}
