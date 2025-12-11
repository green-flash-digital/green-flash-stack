import type { Draft } from "immer";
import { produce } from "immer";
import { Logarhythm } from "logarhythm";

export type TransactionStoreEnqueueOptionsStatic = {
  /**
   * Notify subscribers when state changes
   * @default true
   */
  notify?: boolean;
  /**
   * Apply mutation optimistically before awaiting the async action
   * @default true
   */
  optimistic?: boolean;
};

export type TransactionStoreEnqueueOptions<S, R> = {
  /**
   * The optimistic mutation to apply immediately
   * */
  mutate: (draft: Draft<S>) => void;
  /**
   * Optional async side effect (e.g., API call)
   */
  action?: () => Promise<R>;
  /**
   * Optional reconciliation step using returned data
   */
  reconcile?: (draft: Draft<S>, result: R) => void;
  /**
   * Optionally run a handler after the state has been
   * successfully mutated
   */
  onAfterCommit?: (result?: R) => void | Promise<void>;
  /**
   * @default true
   */
  rollback?: boolean;
  debounce?: number;
  debounceKey?: string;
} & TransactionStoreEnqueueOptionsStatic;

/**
 * A queued state store with optimistic updates.
 * Handles both sync and async mutations in sequence.
 */
export class TransactionStore<S> {
  #state: S;
  #queue: Promise<unknown> = Promise.resolve();
  #subscribers = new Set<() => void>();
  #log: Logarhythm;
  #debounceTimers = new Map<string, NodeJS.Timeout>();

  constructor(initialState: S) {
    this.#state = initialState;
    this.#log = new Logarhythm({
      name: "TransactionStore",
      pillColor: "#202020ff",
    });

    this.enqueue = this.enqueue.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.getState = this.getState.bind(this);
  }

  /** Returns the current state snapshot */
  getState = (): S => this.#state;

  /** React-compatible subscription for useSyncExternalStore */
  subscribe = (listener: () => void): (() => void) => {
    this.#log.info("Subscribing to UI updates");
    this.#subscribers.add(listener);
    return () => this.#subscribers.delete(listener);
  };

  /**
   * Notifies all subscribers
   * This will cause whatever mechanism that is subscribed to
   * the engine to update. Specifically in React's case, calling
   * this will cause the UI to take a new snapshot of the state
   * and update the UI.
   */
  notify() {
    for (const listener of this.#subscribers) listener();
  }

  /**
   * Applies a queued transactional update with optional debounce,
   * optimistic UI update, reconciliation, and lifecycle hooks.
   */
  enqueue<R>({
    mutate,
    action,
    reconcile,
    onAfterCommit,
    rollback = true,
    notify = true,
    optimistic = true,
    debounce,
    debounceKey,
  }: TransactionStoreEnqueueOptions<S, R>) {
    const key = debounceKey ?? `${mutate.toString()}-${action?.toString()}`;

    if (debounce) {
      clearTimeout(this.#debounceTimers.get(key));
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          this.#debounceTimers.delete(key);
          this.#performTransaction({
            mutate,
            action,
            reconcile,
            onAfterCommit,
            rollback,
            notify,
            optimistic,
          })
            .then(resolve)
            .catch(reject);
        }, debounce);
        this.#debounceTimers.set(key, timer);
      });
    }

    return this.#performTransaction({
      mutate,
      action,
      reconcile,
      onAfterCommit,
      rollback,
      notify,
      optimistic,
    });
  }

  async #performTransaction<R>({
    mutate,
    action,
    reconcile,
    onAfterCommit,
    rollback,
    notify,
    optimistic,
  }: Omit<TransactionStoreEnqueueOptions<S, R>, "debounce" | "debounceKey">) {
    this.#queue = this.#queue.then(async () => {
      const prevState = this.#state;

      if (optimistic) {
        this.#state = produce(prevState, mutate);
        if (notify) this.notify();
      }

      if (!action && onAfterCommit) return onAfterCommit();
      if (!action) return;

      // Run the async side effect
      try {
        const result = await action();

        // Reconcile if there is a function to reconcile the response
        // async side effect response
        if (reconcile) {
          this.#state = produce(this.#state, (draft) => {
            reconcile(draft, result);
          });
          if (notify) this.notify();
        }

        if (onAfterCommit) await onAfterCommit(result);
        return result;
      } catch (err) {
        this.#log.error("[TransactionStore] Rollback due to failure:", err);
        if (rollback) {
          this.#state = prevState;
          if (notify) this.notify();
        }
        throw err;
      }
    });

    return this.#queue;
  }

  /** Clears all subscribers (for cleanup / teardown) */
  destroy() {
    this.#log.info("Clearing all subscribers");
    this.#subscribers.clear();
  }
}
