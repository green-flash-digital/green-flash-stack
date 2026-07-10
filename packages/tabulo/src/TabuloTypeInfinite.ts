import { castDraft } from "immer";
import { Logarhythm } from "logarhythm";

import type { TabuloOptions } from "./Tabulo.js";
import { Tabulo } from "./Tabulo.js";
import {
  type TabuloEventMap,
  type TabuloExtendedState,
  type ManagerMutationOptions,
  type TabuloSort,
  type TabuloColumnConfig,
  type TabuloColumnState,
  type TabuloFilter,
  type TabuloFetcher,
  type TabuloMethods,
  type TabuloRecord,
  logColor
} from "./tabulo.utils.js";

export type TabuloTypeInfiniteStrategy = { strategy: "manual" } | { strategy: "auto" };

export type TabuloTypeInfiniteOptions<
  R extends TabuloRecord,
  F extends TabuloFilter,
  S extends TabuloSort,
  C extends TabuloColumnConfig<R>,
  X extends TabuloExtendedState = undefined
> = TabuloOptions<R, F, S, C, X> & TabuloTypeInfiniteStrategy;

export abstract class TabuloTypeInfinite<
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

  #requestHasMorePages: boolean;
  #requestPage: number;
  #observer: IntersectionObserver | undefined;
  #observerNode: HTMLElement | null = null;
  #loadStrategy: TabuloTypeInfiniteStrategy["strategy"];
  #tabularNode: HTMLElement | null = null;
  #fetcher: TabuloFetcher<R>;

  constructor(options: TabuloTypeInfiniteOptions<R, F, S, C, X>, fetcher: TabuloFetcher<R>) {
    super(options);
    this.log = new Logarhythm({
      name: `${options.name}:engine:infinite`,
      pillColor: logColor.type
    });
    this.log.info("Creating engine...");
    this.#fetcher = fetcher;
    this.#requestPage = 1;
    this.#requestHasMorePages = true;
    this.#loadStrategy = options.strategy;

    this.reload = this.reload.bind(this);
    this.destroy = this.destroy.bind(this);
    this.loadNextPage = this.loadNextPage.bind(this);
    this.loadNextPageWhenVisible = this.loadNextPageWhenVisible.bind(this);
    this.log.info("Creating engine... complete.");

    // listeners
    this.log.info("Creating listeners...");
    this.on("filter:change", this.#handleFilterSortChange.bind(this));
    this.on("sort:change", this.#handleFilterSortChange.bind(this));
    this.on("group:change", this.#handleFilterSortChange.bind(this));
    this.log.info("Creating listeners... complete.");
  }

  /**
   * Private handler to update records and scrolling position
   * when filtering and sort change
   */
  async #handleFilterSortChange() {
    await this.#resetAndGetNewRecords();
    this.#scrollToTop();
  }

  /**
   * Clears the request params and fetches new records. This
   * has been created to remove duplicate functionality
   * from sort and filter handlers
   */
  async #resetAndGetNewRecords() {
    this.log.info("Resetting request trackers and getting new records");
    // Reset the request parameters
    this.#resetRequestParams();

    // Run the fetcher (fetcher uses this._state)
    const res = await this.#fetcher(1);
    this.#requestHasMorePages = res.moreRecordsAvailable;
    this.#requestPage = 2;

    // Update the state with the new records
    this.queueStateUpdate({
      mutate: (draft) => {
        draft.data.records = castDraft(res.records);
        draft.data.meta.loadingMore = false;
        draft.data.meta.totalRecords = res.totalRecords;
      }
    });
  }

  /**
   * Scrolls to the top of the table
   */
  #scrollToTop() {
    this.log.info("Scrolling to the top of the mounted node...");
    this.#tabularNode?.scroll({ top: 0, behavior: "instant" });
  }

  /**
   * Reloads the table
   */
  async reload(args?: { shouldScrollToTop?: boolean }) {
    this.log.info("Reloading...");
    await this.#resetAndGetNewRecords();

    if (args?.shouldScrollToTop ?? true) {
      this.#scrollToTop();
    }
  }

  /**
   * Initializes the infinite engine data
   */
  protected async _initEngine(node: HTMLElement) {
    this.log.info("Initializing...");
    this.#tabularNode = node;

    await this.filter.init();

    try {
      // Run the fetcher (fetcher uses this._state) and
      // then also the baseline fetcher to determine if
      // any records exist in the DB
      const [res, baseRes] = await Promise.all([
        this.#fetcher(1),
        this.#fetcher(1, { ignoreState: true })
      ]);
      this.#requestHasMorePages = res.moreRecordsAvailable;
      this.#requestPage = 2;

      // Update the state with the new records
      this.queueStateUpdate({
        mutate: (draft) => {
          draft.data.records = castDraft(res.records);
          draft.data.meta.loadingMore = false;
          draft.data.phase = "complete";
          draft.data.meta.totalRecords = res.totalRecords;
          draft.data.meta.hasRecords = baseRes.totalRecords !== 0;

          if (this.records.areAllSelected()) {
            this.log.debug("All records have been selected. Selecting all newly fetched records");
            draft.records.selected = res.records.map((record) => record.id);
          }
        }
      });
    } catch (error) {
      this._handleRequestError(error);
    }
  }

  /**
   * Resets all of the request parameters.
   */
  #resetRequestParams() {
    this.log.debug("Resetting request params");
    this.#requestPage = 1;
    this.#requestHasMorePages = true;
  }

  /**
   * Loads the next page
   */
  async loadNextPage(pageNumOverride?: number) {
    if (!this.#requestHasMorePages) {
      this.log.debug("No more records to fetch. Skipping.");
      return;
    }

    try {
      // increment the next page
      if (pageNumOverride) {
        this.#requestPage = pageNumOverride;
      }

      // Update the loading and dispatch it
      this.log.debug("Loading next page", this.#requestPage);
      this.queueStateUpdate({
        mutate: (draft) => {
          draft.data.meta.loadingMore = true;
        }
      });

      // Get the records
      const res = await this.#fetcher(this.#requestPage);
      this.#requestPage = this.#requestPage + 1;
      this.#requestHasMorePages = res.moreRecordsAvailable;

      // Add the newly fetched records
      this.log.debug("Adding records to state");
      let wereRecordsPreviouslyAllSelected = false;
      this.queueStateUpdate({
        mutate: (draft) => {
          // Set this variable before we update the records
          wereRecordsPreviouslyAllSelected = this.records.areAllSelected();

          const prevRecords = draft.data.records ?? [];
          const newRecords = prevRecords.concat(castDraft(res.records));

          draft.data.phase = "complete";
          draft.data.records = newRecords;
          draft.data.meta.loadingMore = false;
          draft.data.meta.totalRecords = res.totalRecords;
        },
        onAfterCommit: () => {
          if (!wereRecordsPreviouslyAllSelected) return;
          this.log.info("Records we're previously all selected. Selecting all new records");
          this.records.selectAll();
        }
      });

      return res;
    } catch (error) {
      this._handleRequestError(error);
    }
  }

  /**
   * Helper method to determine if there are any more
   * pages that need to be fetched. Helpful when trying to
   * determine which UI controls to surface
   */
  morePagesExist() {
    return this.#requestHasMorePages;
  }

  destroy(params?: { destroyFilters?: boolean; destroySort?: boolean }) {
    // These options disable notifying the UI or emitting events
    // so we can batch them at the end of this method
    const options: ManagerMutationOptions = {
      emit: false,
      optimistic: false,
      notify: false
    };

    this.#requestPage = 1;
    this.#requestHasMorePages = false;
    this.records.deselectAll(options);
    this.#destroyObserver();

    if (params?.destroyFilters) {
      this.filter.clearAll(options);
    }

    if (params?.destroySort) {
      this.sort.clearAll(options);
    }

    // Queue a mutation to update the data
    // the other manager mutations above will be updated
    // along with the data since we're notifying the UI
    // with this mutation
    this.queueStateUpdate({
      mutate: (draft) => {
        draft.data = {
          phase: "initial-loading",
          error: undefined,
          records: [],
          isRefreshing: false,
          loadingMessage: draft.data.loadingMessage,
          meta: {
            loadingMore: false,
            totalRecords: 0,
            hasRecords: true
          }
        };
      }
    });
  }

  getStrategy() {
    return this.#loadStrategy;
  }

  /**
   * Private method to remove all references to the intersection observer
   */
  #destroyObserver() {
    if (!this.#observer || !this.#observerNode) return;
    this.log.debug("Removing observer observer");

    this.#observer.unobserve(this.#observerNode);

    this.#observer = undefined;
    this.#observerNode = null;
  }

  /**
   * Creates an intersection observer to listen for when the node scrolls into
   * the viewable DOM. When it does scroll into view (depending upon the threshold)
   * that was set in the engine constructor, this will load the next page.
   */
  loadNextPageWhenVisible<T extends HTMLElement>(node: T) {
    if (this.#loadStrategy === "manual") {
      this.log.warn(
        `You have attempted to listen to the intersection of this node with the visible DOM. However, your engine's loading strategy is "${
          this.#loadStrategy
        }". Either remove this method from the node or change your engine's loading strategy to "auto".`
      );
      return;
    }

    this.#observerNode = node;

    // Create the observer
    if (!this.#observer) {
      this.#observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          this.loadNextPage();
        },
        {
          threshold: 0.0 // will fire even when 1px shows in the DOM
        }
      );
    }

    this.#observer.observe(node);
  }
}
