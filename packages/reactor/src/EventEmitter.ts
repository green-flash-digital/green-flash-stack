import type { LogarhythmLogLevel } from "logarhythm";
import { Logarhythm } from "logarhythm";

export type EventMap = Record<string, unknown>;

/**
 * Type-safe event emitter
 */
export class EventEmitter<T extends EventMap> {
  #listeners: { [K in keyof T]?: Set<(payload: T[K]) => void> } = {};
  #log: Logarhythm;

  constructor(options?: {
    name?: string;
    logColor?: string;
    logLevel?: LogarhythmLogLevel;
  }) {
    this.#log = new Logarhythm({
      logLevel: options?.logLevel,
      name: options?.name ? `${options.name}:events` : "EventEmitter",
      pillColor: options?.logColor ?? "#202020ff",
    });
  }

  /** Register a listener */
  on<K extends keyof T>(event: K, listener: (payload: T[K]) => void) {
    if (!this.#listeners[event]) {
      this.#listeners[event] = new Set();
    }
    this.#log.info(`Listening for event "${String(event)}"...`);
    this.#listeners[event]!.add(listener);
    return () => this.off(event, listener);
  }

  /** Remove a listener */
  off<K extends keyof T>(event: K, listener: (payload: T[K]) => void) {
    this.#log.info("Removing listener from event", event);
    this.#listeners[event]?.delete(listener);
  }

  /** Emit an event */
  emit<K extends keyof T>(event: K): void;
  emit<K extends keyof T>(event: K, payload: T[K]): void;
  emit<K extends keyof T>(event: K, payload?: T[K]) {
    this.#log.info(`Emitting "${String(event)}" event`);

    const listeners = this.#listeners[event];
    if (!listeners || listeners.size === 0) {
      return this.#log.debug(`No listeners for`, event);
    }

    this.#log.info(
      `Running ${listeners.size} "${String(event)}" event listener(s)`
    );

    for (const listener of listeners) {
      // payload will be undefined if omitted, but if the event’s payload type
      // isn’t actually undefined, TS will catch that at the call site.
      listener(payload as T[K]);
    }
  }

  /** Clear all listeners */
  clear() {
    this.#log.info("Clearing all event listeners");
    for (const key in this.#listeners) {
      this.#listeners[key]?.clear();
    }
  }
}
