import { castDraft } from "immer";
import { Logarhythm } from "logarhythm";

import {
  type TabuloEventMap,
  type TabuloExtendedState,
  type TabuloColumnConfig,
  type TabuloColumnState,
  type TabuloFetcher,
  type TabuloMethods,
  type TabuloRecord,
  type TabuloFilter,
  type TabuloSort,
  logColor,
} from "./tabular-engine.utils.js";
import type { TabuloOptions } from "./Tabulo.js";
import { Tabulo } from "./Tabulo.js";

export type TabuloTypeEagerOptions<
  R extends TabuloRecord,
  F extends TabuloFilter,
  S extends TabuloSort,
  C extends TabuloColumnConfig<R>,
  X extends TabuloExtendedState = undefined
> = TabuloOptions<R, F, S, C, X>;

export abstract class TabuloTypeEager<
    R extends TabuloRecord,
    F extends TabuloFilter,
    S extends TabuloSort,
    C extends TabuloColumnConfig<R>,
    T extends TabuloColumnState<C>,
    X extends TabuloExtendedState = undefined,
    E extends TabuloEventMap = undefined
  >
  extends Tabulo<R, F, S, C, T, X, E>
  implements TabuloMethods
{
  log: Logarhythm;

  #tabularNode: HTMLElement | null = null;
  #fetcher: TabuloFetcher<R>;

  abstract onMount(node: HTMLDivElement): Promise<void>;

  constructor(
    options: TabuloTypeEagerOptions<R, F, S, C, X>,
    fetcher: TabuloFetcher<R>
  ) {
    super(options);
    this.log = new Logarhythm({
      name: `${options.name}:engine:eager`,
      pillColor: logColor.type,
    });
    this.log.info("Creating engine...");
    this.#fetcher = fetcher;

    this.reload = this.reload.bind(this);
    this.destroy = this.destroy.bind(this);

    // listeners
    this.log.info("Creating engine... complete.");
    this.on("filter:change", this.#fetchAndResetScroll.bind(this));
    this.on("sort:change", this.#fetchAndResetScroll.bind(this));
  }

  /**
   * Fetch new records and reset scrolling
   */
  async #fetchAndResetScroll() {
    // Set as refreshing
    this.queueStateUpdate({
      mutate: (draft) => {
        draft.data.isRefreshing = true;
        draft.data.pendingReason = "refresh";
      },
    });

    this.log.info("Resetting scrolling and fetching new records...");
    this.#tabularNode?.scroll({ top: 0, behavior: "instant" });
    await this.#getAndSetNewRecords();
  }

  /**
   * A private central handler that will clear
   * the request params and get and set new records. This
   * has been created to remove duplicate functionality
   * from sort and filter handlers
   */
  async #getAndSetNewRecords() {
    // Run the fetcher (fetcher uses this._state)
    const res = await this.#fetcher(1);

    // Update the state with the new records
    this.queueStateUpdate({
      mutate: (draft) => {
        draft.data.isRefreshing = false;
        draft.data.records = castDraft(res.records);
        draft.data.meta.loadingMore = false;
        draft.data.meta.totalRecords = res.totalRecords;
      },
    });
  }

  /**
   * Reloads the table. Does not reset filters or sorting
   */
  async reload() {
    this.log.info("Reloading...");
    this.#getAndSetNewRecords();
  }

  /**
   * Deselects all records & clears filters & sorting
   */
  public destroy() {
    this.records.deselectAll({ notify: false });
    this.filter.clearAll({ notify: false });
    this.sort.clearAll({ notify: false });

    // Notify the UI after they're all done
    this.notify();
  }

  /**
   * Initializes the eager engine
   */
  protected async _initEngine(node: HTMLElement) {
    this.log.info("Initializing...");
    this.#tabularNode = node;

    await this.filter.init();

    // Fetch the records and complete initialization
    try {
      const res = await this.#fetcher(1);
      this.queueStateUpdate({
        mutate: (draft) => {
          draft.data = {
            phase: "complete",
            isRefreshing: false,
            records: castDraft(res.records),
            loadingMessage: draft.data.loadingMessage,
            error: undefined,
            meta: {
              loadingMore: false,
              totalRecords: res.totalRecords,
              hasRecords: true,
            },
          };
        },
      });
    } catch (error) {
      this._handleRequestError(error);
    }
  }
}
