import type { Draft } from "immer";
import { produce } from "immer";
import type { Isoscribe } from "isoscribe";

export type SetAsyncStateQueueState<T extends Record<string, unknown>> = (
  fn: (draft: Draft<T>) => void,
  options?: { shouldLog?: boolean }
) => void;

export class AsyncStateQueue<T> implements AsyncIterable<T> {
  private _queue: T[] = [];
  private _resolvers: ((value: IteratorResult<T>) => void)[] = [];
  private _listeners = new Set<() => void>();
  private _closed = false;
  private _log: Isoscribe;
  private _state: T;

  constructor(initialState: T, log: Isoscribe) {
    this._state = initialState;
    this._log = log;
    this.subscribe = this.subscribe.bind(this);
    this.getSnapshot = this.getSnapshot.bind(this);
    this.getQueue = this.getQueue.bind(this);
    this.setState = this.setState.bind(this);
  }

  setState(fn: (draft: Draft<typeof this._state>) => void, options?: { shouldLog?: boolean }) {
    this._state = produce(this._state, fn);
    this.dispatchState("state::mutation", options);
  }

  dispatchState(name: string, options?: { shouldLog?: boolean }) {
    // Queue the state update
    const shouldLog = options?.shouldLog ?? true;
    if (shouldLog) {
      this._log.debug(`state::dispatch::${name}`, this._state);
    }
    this._enqueue(this._state);
  }

  getQueue() {
    return this._queue;
  }

  getState() {
    return this._state;
  }

  private _enqueue(item: T) {
    this._state = item;

    // For async consumers
    if (this._resolvers.length > 0) {
      const resolve = this._resolvers.shift()!;
      resolve({ value: item, done: false });
    } else {
      this._queue.push(item);
    }

    // Notify React-style subscribers
    this._listeners.forEach((fn) => fn());
  }

  private _close() {
    this._closed = true;
    while (this._resolvers.length > 0) {
      this._resolvers.shift()!({ value: undefined as unknown, done: true });
    }
    this._listeners.clear();
  }

  getSnapshot(): T {
    return this._state;
  }

  subscribe(callback: () => void): () => void {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return this;
  }

  async next(): Promise<IteratorResult<T>> {
    if (this._queue.length > 0) {
      return { value: this._queue.shift()!, done: false };
    }
    if (this._closed) {
      return { value: undefined as unknown, done: true };
    }
    return new Promise((resolve) => this._resolvers.push(resolve));
  }
}
