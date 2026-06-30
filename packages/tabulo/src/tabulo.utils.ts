import type { Draft } from "immer";
import type {
  EventMap,
  TransactionStoreEnqueueOptionsStatic,
} from "@green-flash/reactor";
import type { ObjectDotNotation } from "@green-flash/ts-utils/isomorphic";

import type { TabuloConfigColumnValue } from "./TabuloManagerColumn.js";

export type TabuloEventMap = EventMap | undefined;

export type TabuloEventColumnChangePayload = {
  columnId: string;
  isVisible: boolean;
};

export type TabuloEventsBase = {
  "filter:init": void;
  "filter:change": void;
  "column:change": TabuloEventColumnChangePayload;
  "columns:change": void;
  "sort:change": void;
  "records:select": void;
  "records:deselect": void;
  "records:selection:enable": void;
  "records:selection:disable": void;
  "group:change": void;
  "data:reload": void;
  "data:error": Error;
  "meta:tick": void;
  "ext:change": void;
};

// --- Events ---
export type TabuloEvents<E extends TabuloEventMap = undefined> =
  E extends undefined ? TabuloEventsBase : E & TabuloEventsBase;

// --- Definitions
export type TabuloRecord = { id: number };
export type TabuloSort = string;
export type TabuloFilter = Record<string, TabuloFilterValue>;
export type TabuloFilterValue = string | number | boolean | null | undefined;
export type TabuloColumnConfig<R extends TabuloRecord> = Record<
  string,
  TabuloConfigColumnValue<R>
>;
export type TabuloColumnState<T extends Record<string, unknown>> = Record<
  keyof T,
  TabuloStateColumnValue
>;
export type TabuloExtendedState = Record<string, unknown> | undefined;

export type NormalizedExtendedState<X> = X extends undefined ? object : X;

// --- STATE: Column ---
export type TabuloStateColumnValue = { isVisible: boolean };
export type TabuloStateColumn = Record<string, TabuloStateColumnValue>;

// --- STATE: Group By
export type TabuloStateGroupRenderFn = (props: {
  rowIndex: number;
  value: string | number | null | boolean;
}) => any;
export type TabuloStateGroup<R extends TabuloRecord> = {
  /**
   * The default key in the array of key|value pairs
   * to group the records by. This value is the initial
   * value set in the state
   */
  key: ObjectDotNotation<R>;
  /**
   * An required function supplied to render items based upon
   * the selected value
   */
  renderFn?: TabuloStateGroupRenderFn;
  /**
   * An optional transformer to transform the value
   * into something that can be displayed. This value is the
   * initial value set in the state
   */
  transform?: (value: unknown, record: R) => string;
};

// --- STATE: Record ---
// --- Handles record selection and metadata
export type TabuloStateRecord = {
  selectable: boolean;
  selected: number[];
};

// --- STATE: Tick ---
export type TabuloStateMeta = {
  tick: 0 | 1;
};

// --- STATE: Sort ---
export type TabuloStateSortValue = "ascending" | "descending" | undefined;
export type TabuloStateSort<S extends TabuloSort> = Record<
  S,
  { value: TabuloStateSortValue }
>;

// --- STATE: Filter ---
export type TabuloStateFilterData<T extends string = string> = {
  /**
   * The value that should be selected and tracked. This is the value
   * that should be operated on in the background
   */
  value: T;
  /**
   * The display representation of the value. In some cases
   * the value is going to be an ID and that is meaningless
   * to the UI.
   */
  displayAs: string | ((value: string) => string);
};
export type TabuloStateFilter<F extends TabuloFilter> = Record<
  keyof F,
  {
    value: TabuloFilterValue;
    /**
     * An array of records for a filter
     */
    data: TabuloStateFilterData[];
    /**
     *  A map that associates a value with a string or i18n function to display
     * Sometimes a filter can be an ID and we want to associated a specific string or i18n
     * function with that ID so it's human readable. This map can be used to easily and efficiently
     * access the display value for the particular filter
     */
    humanReadableValueMap: Map<string, TabuloStateFilterData["displayAs"]>;
  }
>;

// --- STATE: Data
export type TabuloStateData<R extends TabuloRecord> = {
  phase: "initial-loading" | "error" | "complete";
  records: R[];
  error?: unknown;
  loadingMessage: string;
  isRefreshing: boolean;
  pendingReason?: "filters" | "sort" | "pagination" | "mutation" | "refresh";
  meta: {
    totalRecords: number;
    hasRecords: boolean;
    loadingMore?: boolean;
  };
};

// --- STATE: Root
export type TabuloState<
  R extends TabuloRecord,
  F extends TabuloFilter | never,
  S extends TabuloSort,
  C extends TabuloColumnConfig<R>,
  T extends TabuloColumnState<C>,
  X extends TabuloExtendedState = undefined
> = {
  columns: T;
  filter: TabuloStateFilter<F>;
  sort: TabuloStateSort<S>;
  group?: TabuloStateGroup<R>;
  records: TabuloStateRecord;
  meta: TabuloStateMeta;
  data: TabuloStateData<R>;
} & NormalizedExtendedState<X>;

export type TabuloInitState<
  R extends TabuloRecord,
  F extends TabuloFilter | never,
  S extends TabuloSort,
  C extends TabuloColumnConfig<R>,
  T extends TabuloColumnState<C>,
  X extends TabuloExtendedState = undefined
> = Partial<Pick<TabuloState<R, F, S, C, T, X>, "columns" | "filter" | "sort">>;

/**
 * An interface that each domain class should implement
 * to help manage lifecycle and loading
 */
export interface TabuloMethods {
  reload: () => void;
  destroy: () => void;
}

// -------- FETCHER --------
export type TabuloFetcherData<R extends TabuloRecord> = {
  records: R[];
  totalRecords: number;
  moreRecordsAvailable: boolean;
};
export type TabuloFetcherReturn<R extends TabuloRecord> = Promise<
  TabuloFetcherData<R>
>;
export type TabuloFetcherOptions = {
  /**
   * Ignores the state of the data grid
   * to make a fully clean request
   */
  ignoreState?: boolean;
};
export type TabuloFetcher<R extends TabuloRecord> = (
  pageNumber: number,
  options?: TabuloFetcherOptions
) => TabuloFetcherReturn<R>;
// ---------------------------

// -------- ON MOUNT --------
export type TabuloOnMount<E extends HTMLDivElement = HTMLDivElement> = (
  node: E
) => Promise<void>;
// ---------------------------

/**
 * Safely access and mutate a key within an Immer draft,
 * preserving full type information for generics.
 *
 * Immer doesn't play well with generics so this is a convenience
 * fn to ensure that we can easily mutate generic keys on parts of the
 * engine state
 *
 * @param draft - The parent draft object
 * @param key - The key of the entry you want to mutate
 * @param fn - A callback that receives the narrowed draft entry
 */
export function mutateEngineStateHelper<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Record<string, any>,
  K extends keyof T = keyof T
>(
  draft: Draft<T> | T | undefined,
  key: K,
  fn: (entry: Draft<T[K]>) => void
) {
  const entry = (draft as Draft<T> ?? ({} as Draft<T>))[
    key as keyof Draft<T>
  ] as Draft<T[K]>;
  fn(entry);
}

export type ManagerMutationOptions = TransactionStoreEnqueueOptionsStatic & {
  /**
   * ## Emit "side effects" (data fetching, loading, etc...)
   * Determines if an event should be emitted. Set this to `false` if
   * you want to prevent the EngineTypes from processing side effects.
   *
   * For example, when setting a filter on mount, we most likely don't want
   * to emit an event since we don't want to process a refetching side effect
   * until the engine is done
   *
   * However, if we're changing the UI optimistically, we would want to emit
   * a change since we want it to happen right after the mutation takes place.
   * @default true
   */
  emit?: boolean;
};

export const logColor = {
  engine: "#194e39ff",
  type: "#277757ff",
};
