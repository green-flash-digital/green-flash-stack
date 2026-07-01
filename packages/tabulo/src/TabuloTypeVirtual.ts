import type { VirtualItem } from "@tanstack/virtual-core";
import {
  observeElementOffset,
  observeElementRect,
  elementScroll,
  Virtualizer
} from "@tanstack/virtual-core";
import { castDraft } from "immer";
import { Logarhythm } from "logarhythm";

import type { TabuloOptions } from "./Tabulo.js";
import { Tabulo } from "./Tabulo.js";
import {
  type TabuloEventMap,
  type TabuloExtendedState,
  type TabuloFetcherData,
  type TabuloColumnState,
  type TabuloSort,
  type TabuloColumnConfig,
  type TabuloFilter,
  type TabuloFetcher,
  type TabuloMethods,
  type TabuloRecord,
  logColor
} from "./tabulo.utils.js";

export type TabuloTypeVirtualOptions<
  R extends TabuloRecord,
  F extends TabuloFilter,
  S extends TabuloSort,
  C extends TabuloColumnConfig<R>,
  X extends TabuloExtendedState = undefined
> = TabuloOptions<R, F, S, C, X> & {
  /**
   * The starting height of the virtualized row
   * @default 56;
   */
  rowHeight?: number | "variable";
};

type LoadPagePayload<R extends TabuloRecord> = {
  data: TabuloFetcherData<R>;
  insertIndex: number;
};

type VirtualRecord<R extends TabuloRecord> = R | null;

export abstract class TabuloTypeVirtual<
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

  #pageCache = new Map<number, VirtualRecord<R>[]>();
  #pageSize = 100;
  #onChangeTimeout: NodeJS.Timeout | null = null;
  #virtualizer: Virtualizer<HTMLDivElement, Element> | undefined = undefined;
  #virtualScrollNode: HTMLDivElement | null = null;
  #virtualRowHeight: number;
  #spacerNodeTop: HTMLTableCellElement | null = null;
  #spacerNodeBot: HTMLTableCellElement | null = null;
  #fetcher: TabuloFetcher<R>;

  constructor(options: TabuloTypeVirtualOptions<R, F, S, C, X>, fetcher: TabuloFetcher<R>) {
    super(options);
    this.log = new Logarhythm({
      name: `${options.name}:engine:virtual`,
      pillColor: logColor.type
    });
    this.log.info("Creating engine...");
    this.#fetcher = fetcher;
    this.#virtualRowHeight = options.rowHeight === "variable" ? 56 : (options.rowHeight ?? 56);

    this.reload = this.reload.bind(this);
    this.destroy = this.destroy.bind(this);
    this.reload = this.reload.bind(this);
    this.registerSpacerBottom = this.registerSpacerBottom.bind(this);
    this.registerSpacerTop = this.registerSpacerTop.bind(this);

    // listeners
    this.log.info("Creating listeners...");
    this.on("filter:change", this.#resetVirtualRecords.bind(this));
    this.on("sort:change", this.#resetVirtualRecords.bind(this));
    this.on("group:change", this.#resetVirtualRecords.bind(this));
    this.log.info("Creating listeners... complete.");
  }

  #resetPageCache() {
    this.#pageCache = new Map();
  }

  /**
   * Deselects all of the previously selected records
   */
  public destroy() {
    this.records.deselectAll({ optimistic: true, emit: false, notify: false });
    this.#resetPageCache();
    this.notify();
  }

  /**
   * Reloads the table. Does not reset filters or sorting
   */
  public reload() {
    this.#resetVirtualRecords();
    this.notify();
  }

  /**
   * Resets the records that are displayed on the screen
   * 1. Resets the page cache
   * 2. Fetches page 1
   * 3. Creates new virtual records and adds them to the state
   * 4. Resets the virtualizer with the new total records
   * 5. Scrolls the virtualizer to the top of the scrollable area
   * 6. Mutates the state to be complete
   */
  async #resetVirtualRecords() {
    // Reset the request parameters
    this.#resetPageCache();

    // Run the fetcher (fetcher uses this._state)
    const { data } = await this.#getPage(1);

    this.#createVirtualRecords(data);
    // Update the state with the new records
    this.queueStateUpdate({
      mutate: (draft) => {
        draft.data.phase = "complete";
      }
    });

    const v = this.getVirtualizer();
    if (!v) {
      this.log.debug("Virtualizer has not been set yet. Cannot set options or scroll to row.");
      return;
    }
    v.setOptions({ ...v.options, count: data.totalRecords });
    this.scrollToRow(0);
  }

  /**
   * Scroll the virtual engine to a particular row index
   */
  async scrollToRow(rowIndex: number) {
    const v = this.getVirtualizer();
    if (!v) return;
    this.log.debug("Scrolling to row", rowIndex);
    v.scrollToIndex(rowIndex, { align: "start" });
  }

  setVirtualRowHeight(height: number) {
    const v = this.getVirtualizer();
    if (!v) return;
    this.log.debug("Recalculating row height");
    this.#virtualRowHeight = height;
    v.setOptions({ ...v.options });
    v.measure();
    this.#tick();
  }

  #tick() {
    this.queueStateUpdate({
      mutate: (draft) => {
        draft.meta.tick = draft.meta.tick === 0 ? 1 : 0;
      }
    });
  }

  /**
   * Initialize the virtual engine. Should be run when the
   * scrollable node mounts
   */
  protected async _initEngine(node: HTMLDivElement, options?: { rowHeight?: number }) {
    this.log.info("Initializing...");
    this.#virtualScrollNode = node;

    await this.filter.init();

    // Get some initial data
    const { data } = await this.#getPage(1);

    this.#createVirtualRecords(data);

    this.#virtualRowHeight = options?.rowHeight ?? this.#virtualRowHeight;
    this.log.debug("Creating a new virtualizer", this.#virtualRowHeight);

    // Create a new service & set the virtual records
    this.#virtualizer = new Virtualizer({
      count: data.totalRecords,
      getScrollElement: () => this.#virtualScrollNode,
      estimateSize: () => this.#virtualRowHeight,
      overscan: 50,
      scrollToFn: elementScroll,
      observeElementRect,
      observeElementOffset,
      onChange: (instance) => {
        this.#setSpacerHeights(instance);
        this.#tick();
        this.#onVirtualizerChange(instance);
      }
    });

    // Tell the vitalizer that it mounted after the next frame
    requestAnimationFrame(() => {
      if (!this.#virtualizer) return;
      this.#virtualizer._didMount();
      this.#virtualizer._willUpdate();
    });

    // Dispatch a stateful update to the consumer
    this.queueStateUpdate({
      mutate: (draft) => {
        draft.data.phase = "complete";
        draft.data.meta.loadingMore = false;
      }
    });
  }

  /**
   * Evaluates the range provided by the virtualizer to figure out
   * which pages the user stopped scrolling on. It will then compare
   * those pages against the cache to determine if they need to be fetched.
   * If they aren't in the cache, it will run `#getPage` then `_insertVirtualRecords`
   */
  #onVirtualizerChange(virtualizer: Virtualizer<HTMLDivElement, Element>) {
    // Cancel the onChange event if already in flight
    if (this.#onChangeTimeout) {
      this.log.trace("Timeout exists, clearing timeout.");
      clearTimeout(this.#onChangeTimeout);
    }

    // Get the start and end index of where the scroll stopped
    const range = virtualizer.calculateRange();
    this.log.trace("Calculating range", range);
    if (!range) return;

    this.#onChangeTimeout = setTimeout(async () => {
      // Coerce the start and end index's into real pages
      const pagesFromRange = [range.startIndex, range.endIndex].map((rowIndexValue) =>
        Math.ceil(rowIndexValue / this.#pageSize)
      );

      // Loop through each page to fetch
      for (const pageNum of pagesFromRange) {
        // Don't fetch page 0 or already fetched pages
        if (pageNum === 0 || this.#pageCache.has(pageNum)) {
          this.log.trace("Preventing table from fetching more records", {
            pageNum,
            pageNumIs0: pageNum === 0,
            pageCacheHasPageNum: this.#pageCache.has(pageNum)
          });
          continue;
        }

        // Fetch and load the records into the correct state
        this.#pageCache.set(pageNum, []);
        const { insertIndex, data } = await this.#getPage(pageNum);

        // Add the newly fetched records
        this.log.debug(`Inserting records into position: ${insertIndex}`);
        let wereRecordsPreviouslyAllSelected = false;
        this.queueStateUpdate({
          mutate: (draft) => {
            // Set this variable before we update the records
            wereRecordsPreviouslyAllSelected = this.records.areAllSelected();

            const prevRecords = draft.data.records ?? [];
            prevRecords.splice(insertIndex, data.records.length, ...castDraft(data.records));
            draft.data.phase = "complete";
            draft.data.meta.loadingMore = false;
            draft.data.meta.totalRecords = data.totalRecords;
          },
          onAfterCommit: () => {
            if (!wereRecordsPreviouslyAllSelected) return;
            this.log.info("Records we're previously all selected. Selecting all new records");
            this.records.selectAll();
          }
        });
      }

      this.queueStateUpdate({
        mutate: (draft) => {
          draft.data.meta.loadingMore = false;
        }
      });
    }, 50);
  }

  /**
   * Fetches a specific page and adds it to the cache. Returns
   * the data from the fetcher as well as the index in the virtual
   * records store where those newly fetched records should be placed
   */
  async #getPage(pageNum: number): Promise<LoadPagePayload<R>> {
    // Get the records
    const res = await this.#fetcher(pageNum);
    this.#pageCache.set(pageNum, res.records);
    const insertIndex = (pageNum - 1) * this.#pageSize;

    return { data: res, insertIndex };
  }

  /**
   * Creates a new array with the complete length of the total
   * records. The newly fetched records get added to the beginning
   * of the array. This is helpful after running a filter/sort
   * mutations or when initializing the table that requires you
   * to reset the records that are displayed on the screen.
   */
  #createVirtualRecords(data: TabuloFetcherData<R>) {
    const virtualRecords = [...new Array(data.totalRecords)].map((_, i) => {
      const record = data.records[i] ?? null;
      return record;
    });

    // Set the load as successful and dispatch a UI update
    this.queueStateUpdate({
      mutate: (draft) => {
        draft.data.records = castDraft(virtualRecords);
        draft.data.meta.loadingMore = false;
        draft.data.meta.totalRecords = data.totalRecords;
      }
    });
  }

  /**
   * Returns the virtualizer instance
   */
  getVirtualizer() {
    return this.#virtualizer;
  }

  /**
   * Returns the items from the virtualizer instance
   */
  getVirtualRecords() {
    return this.#virtualizer?.getVirtualItems();
  }

  /**
   * Provided an element, this method extracts the row id from the
   * virtual node
   */
  getRowIdFromNode<T extends HTMLElement>(node: T): number {
    const row = node.dataset.rowId;
    if (!row) {
      throw new Error(
        "Unable to get row id from node. This should not have happened. Please contact support."
      );
    }
    return Number(node.dataset.rowId);
  }

  /**
   * Helper method to return pre-calculated set of props to
   * supply to referable nodes. This is an opinionated helper
   * to make it easy to render fixed height table rows
   */
  getRecordAttrs(virtualItem: VirtualItem) {
    const state = this.getState();
    const record = state.data.records[virtualItem.index];

    return {
      record,
      key: `row-${virtualItem.index}`,
      ["data-row-id"]: virtualItem.index,
      className: virtualItem.index % 2 ? "odd" : "even",
      height: virtualItem.size
    };
  }

  /**
   * Set's the height of the spacers
   */
  #setSpacerHeights(v: Virtualizer<HTMLDivElement, Element> | undefined) {
    if (!v) return;

    const virtualItems = v.getVirtualItems();
    if (!virtualItems.length) return;

    const firstItem = virtualItems[0];
    const lastItem = virtualItems[virtualItems.length - 1];

    const paddingTop = firstItem.start;
    const paddingBottom = v.getTotalSize() - lastItem.end;

    if (!this.#spacerNodeTop || !this.#spacerNodeBot) return;
    this.#spacerNodeTop.style.height = `${paddingTop}px`;
    this.#spacerNodeTop.parentElement!.style.height = `${paddingTop}px`;

    this.#spacerNodeBot.style.height = `${paddingBottom}px`;
    this.#spacerNodeBot.parentElement!.style.height = `${paddingBottom}px`;
  }

  private _createSpacerContent(trNode: HTMLTableRowElement) {
    const tdNode = document.createElement("td");
    tdNode.style.padding = "0";
    tdNode.colSpan = this.columns.length;

    trNode.appendChild(tdNode);
    return tdNode;
  }

  /**
   * Creates a spacer node when the virtualizer is used with
   * native HTML tables. This allows the container to fully
   * scroll all of the way.
   */
  registerSpacerTop(node: HTMLTableRowElement | null) {
    if (!node) return;
    this.log.debug("Registering spacer top");
    this.#spacerNodeTop = this._createSpacerContent(node);
    this.#setSpacerHeights(this.#virtualizer);
    this.setVirtualRowHeight(this.#virtualRowHeight);
  }

  registerSpacerBottom(node: HTMLTableRowElement | null) {
    if (!node) return;
    this.log.debug("Registering spacer bot");
    this.#spacerNodeBot = this._createSpacerContent(node);
    this.#setSpacerHeights(this.#virtualizer);
    this.setVirtualRowHeight(this.#virtualRowHeight);
  }
}
