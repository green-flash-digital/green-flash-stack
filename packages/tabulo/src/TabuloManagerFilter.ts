import { Logarhythm } from "logarhythm";

import type {
  TabuloStateFilterData,
  TabuloFilterValue,
  TabuloFilter,
  TabuloRecord,
  TabuloSort,
  TabuloStateFilter,
  ManagerMutationOptions,
  TabuloColumnConfig,
  TabuloColumnState,
  TabuloExtendedState,
  TabuloEventMap,
} from "./tabulo.utils.js";
import { mutateEngineStateHelper } from "./tabulo.utils.js";
import type { Tabulo } from "./Tabulo.js";

export type TabuloConfigFilter<F extends TabuloFilter> = Record<
  keyof F,
  TabuloConfigFilterValue
>;

export type TabuloConfigFilterValue = {
  label: string;
  getRecords?: () => Promise<TabuloStateFilterData[] | false>;
  defaultValue?: TabuloFilterValue;
};

export type TabuloFilterActions = {
  setValue: (
    value: TabuloFilterValue,
    opts?: ManagerMutationOptions
  ) => Promise<void>;
  getValue: () => string | undefined;
  clearValue: (opts?: ManagerMutationOptions) => Promise<void>;
  getData: () => TabuloStateFilterData<string>[];
  getCount: () => number;
  getDisplayFromValue: (value: TabuloFilterValue) => string;
};

export type TabuloFilterDef = TabuloFilterActions & {
  key: string;
  config: TabuloConfigFilterValue;
};
/**
 * Centralized manager for all filters
 */
export class TabuloManagerFilter<
  R extends TabuloRecord,
  F extends TabuloFilter,
  S extends TabuloSort,
  C extends TabuloColumnConfig<R>,
  T extends TabuloColumnState<C>,
  X extends TabuloExtendedState = undefined,
  E extends TabuloEventMap = undefined
> {
  #engine: Tabulo<R, F, S, C, T, X, E>;
  #config: TabuloConfigFilter<F> | undefined;
  #log: Logarhythm;
  #filters: Map<keyof F, TabuloFilterDef>;
  entries: Array<[keyof F, TabuloFilterDef]>;

  constructor(
    engine: Tabulo<R, F, S, C, T, X, E>,
    config?: TabuloConfigFilter<F>
  ) {
    this.#engine = engine;
    this.#config = config ?? undefined;
    this.#log = new Logarhythm({
      name: `${this.#engine.debugName}:engine-manager:filter`,
      pillColor: this.#engine.debugColor,
    });
    this.#filters = new Map();
    for (const [key, config] of Object.entries(this.#config ?? {})) {
      this.#filters.set(key as keyof F, {
        config,
        key,
        setValue: async (value, opts) => this.setFilterValue(key, value, opts),
        getValue: () => {
          const state = this.#getFilterState(key);
          return state?.value ? state.value.toString() : undefined;
        },
        clearValue: async (opts) => this.clearFilterValue(key, opts),
        getCount: () => this.getFilterCount(key),
        getData: () => {
          const state = this.#getFilterState(key);
          return state.data;
        },
        getDisplayFromValue: (value) => {
          return this.getDisplayFromValue(key, value);
        },
      });
    }
    this.entries = [...this.#filters.entries()];
  }

  // Initialize the filter state so that it exists during creation
  static createInitState<F extends TabuloFilter>(
    config?: TabuloConfigFilter<F>
  ): TabuloStateFilter<F> {
    return Object.entries(config ?? {}).reduce<TabuloStateFilter<F>>(
      (accum, [filterKey, config]) => ({
        ...accum,
        [filterKey]: {
          data: [],
          humanReadableValueMap: new Map(),
          value: config.defaultValue ?? undefined,
        },
      }),
      {} as TabuloStateFilter<F>
    );
  }

  /**
   * Reads the configuration and fetches the records associated with
   * the `getRecords` key on the filter configuration. This method is
   * NOT intended to be used externally; only internally to the
   * engine type domain class
   */
  async init() {
    const getAndSetAllFilterConfigData = Object.entries(this.#config ?? {}).map(
      async ([filterKey, filterConfig]) => {
        const key = filterKey as keyof F;
        let records = filterConfig.getRecords
          ? await filterConfig.getRecords()
          : [];
        if (records === false) records = [];

        await this.#engine.queueStateUpdate({
          mutate: (draft) => {
            mutateEngineStateHelper(draft.filter, key, (filter) => {
              filter.data = records;
              filter.humanReadableValueMap = new Map(
                records.map((r) => [r.value, r.displayAs])
              );
            });
          },
          optimistic: true,
          notify: false,
        });
      }
    );
    await Promise.all(getAndSetAllFilterConfigData);
  }

  /**
   * Returns a boolean value that indicates if the tabular
   * engine state has any well formed filters.
   */
  isFiltered() {
    return Object.keys(this.normalizeState()).length > 0;
  }

  /**
   * Returns the configuration of all of the filters
   */
  getConfig() {
    return this.#config;
  }

  /**
   * Returns the configuration of a column as well
   * as scoped actions to operate on the column
   */
  getFilter<K extends keyof F>(key: K) {
    const filter = this.#filters.get(key);
    if (!filter) {
      throw new Error(
        `Unable to find a filter entry for the "${String(
          key
        )}". Ensure that the filter you're trying to access is defined in the constructor of your tabular engine.`
      );
    }
    return filter;
  }

  /**
   * Returns the state of a specific filter
   */
  #getFilterState<K extends keyof F>(key: K) {
    const filterState = this.#engine.getState().filter[key];
    if (!filterState) {
      throw new Error(
        `The filter state for "${key.toString()}" is "undefined". Ensure that you're declaring it when instantiating the "${
          this.#engine.debugName
        }" engine.`
      );
    }
    return filterState;
  }

  /**
   * Returns the number of values that have been
   * set for that filter. By design, all filters that are
   * strings are comma delimited so this method checks
   * to see how many times it can split the string
   */
  getFilterCount<K extends keyof F>(key: K) {
    const filterState = this.#getFilterState(key);
    if (isValueEmpty(filterState.value)) return 0;
    return filterState.value.toString().split(",").length;
  }

  /**
   * Set the value of a filter
   */
  async setFilterValue<K extends keyof F>(
    key: K,
    value: TabuloFilterValue,
    options?: ManagerMutationOptions
  ) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        this.#log.info("Setting filter value", { key, value });
        mutateEngineStateHelper(draft.filter, key, (filter) => {
          filter.value = value;
        });
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("filter:change");
      },
    });
  }

  /**
   * Clear the value of a filter. Set's the value
   * of the filter to undefined
   */
  async clearFilterValue<K extends keyof F>(
    key: K,
    options?: ManagerMutationOptions
  ) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        this.#log.info("Clearing filter", { key });
        mutateEngineStateHelper(draft.filter, key, (filter) => {
          filter.value = undefined;
        });
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("filter:change");
      },
    });
  }

  /**
   * Clears the values of one or many filters
   */
  async clearSomeFilterValues<K extends keyof F>(
    filterKeys: K[],
    options?: ManagerMutationOptions
  ) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        this.#log.info("Clearing filter values for", {
          filters: filterKeys.toString(),
        });
        for (const filterKey of filterKeys) {
          mutateEngineStateHelper(draft.filter, filterKey, (filter) => {
            filter.value = undefined;
          });
        }
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("filter:change");
      },
    });
  }

  /**
   * Clears all of the values of the filters except for
   * the filters defined in the arguments
   */
  async clearAllFilterValuesExcept<K extends keyof F>(
    ignoredFilterKeys: K[],
    options?: ManagerMutationOptions
  ) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        this.#log.info("Clearing all filter values except for", {
          filters: ignoredFilterKeys.toString(),
        });
        for (const [filterKey] of this.entries) {
          const key = filterKey as K;
          if (ignoredFilterKeys.includes(key)) continue;
          mutateEngineStateHelper(draft.filter, filterKey, (filter) => {
            filter.value = undefined;
          });
        }
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("filter:change");
      },
    });
  }

  /**
   * Get display string for a given filter value
   */
  getDisplayFromValue<K extends keyof F>(
    key: K,
    value: TabuloFilterValue
  ): string {
    if (!value) return "";
    const state = this.#engine.getState().filter[key];
    if (!state.data) {
      throw new Error(
        `The data for the filter "${key.toString()}" doesn't exist. This means that the filter hasn't been initialized correctly. This should not have happened. Please contact support.`
      );
    }

    return value
      .toString()
      .split(",")
      .map((v) => {
        const display = state.humanReadableValueMap.get(v);
        return typeof display === "function" ? display(v) : display ?? v;
      })
      .join(", ");
  }

  /**
   * Count active filters
   */
  getFilterCounts() {
    return Object.keys(this.#config ?? {}).reduce(
      (accum, filterKey) => {
        const count = this.getFilterCount(filterKey);
        if (count === 0) return accum;

        return {
          keys: accum.keys + 1,
          values: accum.values + count,
        };
      },
      { keys: 0, values: 0 }
    );
  }

  /**
   * Clear some filters
   */
  async clearSome(filterKeys: (keyof F)[], options?: ManagerMutationOptions) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        this.#log.info("Clearing filters", { filterKeys });
        for (const filterKey of filterKeys) {
          mutateEngineStateHelper(draft.filter, filterKey, (filter) => {
            filter.value = undefined;
          });
        }
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("filter:change");
      },
    });
  }

  /**
   * Clear all filters
   */
  async clearAll(options?: ManagerMutationOptions) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        this.#log.info("Clearing all filters");
        for (const [filterKey] of this.entries) {
          mutateEngineStateHelper(draft.filter, filterKey, (filter) => {
            filter.value = undefined;
          });
        }
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("filter:change");
      },
    });
  }

  /**
   * Normalizes the complex state into a key/value pairs
   */
  normalizeState(): Partial<Record<keyof F, string>> {
    this.#log.info("Normalizing filters...");
    const filterState = this.#engine.getState().filter;

    const normalizedObj = Object.entries(filterState).reduce<
      Partial<Record<keyof F, string>>
    >((accum, [filterKey, filterState]) => {
      const { value } = filterState;

      const isUndefined = typeof value === "undefined";
      const isNull = value === null;
      const isEmptyString = typeof value === "string" && value === "";

      if (isUndefined || isNull || isEmptyString) return accum;
      return Object.assign(accum, { [filterKey]: value });
    }, {});

    this.#log.info("Normalizing filters... done", normalizedObj);

    return normalizedObj;
  }

  /**
   * Set's each filter entry value by reading form the URLSearchParams
   * object. This should be used to easily initialize the filter values
   * from the URL search params
   */
  setValuesFromURLSearchParams(options?: ManagerMutationOptions) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    for (const [filterKey, filter] of this.entries) {
      const initValue = urlSearchParams.get(filterKey.toString());
      if (!initValue) continue;
      filter.setValue(initValue, options);
    }
  }

  /**
   * Set's 1 or many filter values
   */
  async setValues(
    filters: Partial<Record<keyof F, TabuloFilterValue>>,
    options?: ManagerMutationOptions
  ) {
    this.#log.info("Setting multiple values", filters);

    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        for (const [filterKey, filterValue] of Object.entries(filters)) {
          mutateEngineStateHelper(draft.filter, filterKey, (filter) => {
            filter.value = filterValue;
          });
        }
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("filter:change");
      },
    });
  }
}

function isValueEmpty(value: TabuloFilterValue) {
  return typeof value === "undefined" || value === null || value === "";
}
