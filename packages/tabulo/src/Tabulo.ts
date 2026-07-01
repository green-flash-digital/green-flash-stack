import { TransactionStore, EventEmitter } from "@green-flash/reactor";
import { Logarhythm } from "logarhythm";

import {
  type TabuloEventMap,
  type NormalizedExtendedState,
  type TabuloColumnConfig,
  type TabuloColumnState,
  type TabuloEvents,
  type TabuloFilter,
  type TabuloRecord,
  type TabuloExtendedState,
  type TabuloSort,
  type TabuloState,
  logColor
} from "./tabulo.utils.js";
import { TabuloManagerColumn } from "./TabuloManagerColumn.js";
import type { TabuloConfigFilter } from "./TabuloManagerFilter.js";
import { TabuloManagerFilter } from "./TabuloManagerFilter.js";
import type { TabuloConfigGroup } from "./TabuloManagerGroup.js";
import { TabuloManagerGroup } from "./TabuloManagerGroup.js";
import type { TabuloConfigMeta } from "./TabuloManagerMeta.js";
import { TabuloManagerMeta } from "./TabuloManagerMeta.js";
import type { TabuloConfigRecords } from "./TabuloManagerRecords.js";
import { TabuloManagerRecords } from "./TabuloManagerRecords.js";
import type { TabuloConfigSort } from "./TabuloManagerSort.js";
import { TabuloManagerSort } from "./TabuloManagerSort.js";

export type TabuloOptions<
  R extends TabuloRecord,
  F extends TabuloFilter,
  S extends TabuloSort,
  C extends TabuloColumnConfig<R>,
  X extends TabuloExtendedState | undefined = undefined
> = {
  name: string;
  columns: C;
  filter?: TabuloConfigFilter<F>;
  sort?: TabuloConfigSort<S>;
  records?: TabuloConfigRecords;
  group?: TabuloConfigGroup<R>;
  meta?: TabuloConfigMeta;
} & NormalizedExtendedState<X>;

/**
 * A thin orchestration layer on top of the TransactionStore
 * which provides methods for mutating, recalling, and transacting
 * on the tabular state
 *
 * This extends the thin EventEmitter which allows
 * every custom engine (infinite, virtual, etc...) to register
 * and react to typed events.
 *
 * For example, the FilterManager emits a singular event and custom engine
 * subclasses can react differently to that event. So let's say the filter
 * manager changes the state of a filter. Once that state is queued for a
 * change, it emits a "filter:change" event. The Infinite engine does something
 * inherently different with the filter change than the virtual engine.
 *
 * All managers essentially become a named way to mutate the state of the Tabulo
 * and the custom engines (infinite, virtual, etc...) will register some actions
 * after that event.
 */
export class Tabulo<
  R extends TabuloRecord,
  F extends TabuloFilter,
  S extends TabuloSort,
  C extends TabuloColumnConfig<R>,
  T extends TabuloColumnState<C>,
  X extends TabuloExtendedState = undefined,
  E extends TabuloEventMap = undefined
> extends EventEmitter<TabuloEvents<E>> {
  #store: TransactionStore<TabuloState<R, F, S, C, T, X>>;
  #log: Logarhythm;

  columns: TabuloManagerColumn<R, F, S, C, T, X, E>;
  filter: TabuloManagerFilter<R, F, S, C, T, X, E>;
  sort: TabuloManagerSort<R, F, S, C, T, X, E>;
  group: TabuloManagerGroup<R, F, S, C, T, X, E>;
  records: TabuloManagerRecords<R, F, S, C, T, X, E>;
  meta: TabuloManagerMeta<R, F, S, C, T, X, E>;
  debugName: string;
  debugColor: string;
  getState: TransactionStore<TabuloState<R, F, S, C, T, X>>["getState"];
  subscribe: TransactionStore<TabuloState<R, F, S, C, T, X>>["subscribe"];
  /**
   * Performs a transactional state update.
   *
   * - Supports optimistic UI updates
   * - Queues transactions sequentially to prevent race conditions
   * - Optionally debounces rapid calls (e.g. filters, typing)
   * - Can reconcile authoritative server data or roll back on failure
   *
   * Example:
   * ```ts
   * await this.queueStateUpdate({
   *   mutate: (draft) => { draft.ui.filter = "active"; },
   *   action: async () => apiClient.put("/filters", { filter: "active" }),
   *   reconcile: (draft, serverFilter) => { draft.ui.filter = serverFilter; },
   * });
   * ```
   */
  queueStateUpdate: TransactionStore<TabuloState<R, F, S, C, T, X>>["enqueue"];

  constructor(o: TabuloOptions<R, F, S, C, X>) {
    super({ name: o.name, logColor: logColor.engine });
    this.#log = new Logarhythm({
      name: `${o.name}:engine`,
      pillColor: logColor.engine
    });
    this.#log.info("Initializing state");
    this.#store = new TransactionStore<TabuloState<R, F, S, C, T, X>>({
      ...o,
      columns: TabuloManagerColumn.createInitState<R, C, T>(o.columns),
      filter: TabuloManagerFilter.createInitState<F>(o.filter),
      sort: TabuloManagerSort.createInitState<S>(o.sort),
      records: TabuloManagerRecords.createInitState(o.records),
      group: TabuloManagerGroup.createInitState<R>(o.group),
      data: {
        phase: "initial-loading",
        error: undefined,
        records: [],
        isRefreshing: false,
        loadingMessage: "data-grid.loading.default",
        meta: {
          loadingMore: false,
          totalRecords: 0,
          hasRecords: true
        }
      },
      meta: { tick: 0 }
    });

    this.debugName = o.name;
    this.debugColor = logColor.engine;
    this.sort = new TabuloManagerSort(this, o.sort);
    this.group = new TabuloManagerGroup(this, o.group);
    this.records = new TabuloManagerRecords(this, o.records);
    this.columns = new TabuloManagerColumn(this, o.columns);
    this.filter = new TabuloManagerFilter(this, o.filter);
    this.meta = new TabuloManagerMeta(this, o.meta);

    // Public React-compatible hooks
    this.getState = this.#store.getState;
    this.subscribe = this.#store.subscribe;

    // Bounded methods
    this.notify = this.notify.bind(this);
    this.queueStateUpdate = this.#store.enqueue.bind(this);
  }

  /**
   * Manually force the UI to update based upon the
   * latest state
   */
  notify() {
    this.#log.debug("Notifying all UI subscribers of update state...");
    return this.#store.notify();
  }

  /**
   * Cleanup
   */
  destroy() {
    this.#store.destroy();
    this.clear();
  }

  /**
   * Helper method to easily set the loading message when
   * data is being fetched, refreshed, etc...
   */
  protected _setLoadingMessage(message: string) {
    this.queueStateUpdate({
      mutate: (draft) => {
        draft.data.loadingMessage = message;
      }
    });
  }

  /**
   * Central handler for easily creating an error state
   * when a request fails
   */
  protected _handleRequestError(error: unknown) {
    this.queueStateUpdate({
      mutate: (draft) => {
        draft.data = {
          phase: "error",
          isRefreshing: false,
          records: [],
          error: String(error),
          loadingMessage: draft.data.loadingMessage ?? "global.loading",
          meta: {
            loadingMore: false,
            totalRecords: 0,
            hasRecords: false
          }
        };
      }
    });
  }
}
