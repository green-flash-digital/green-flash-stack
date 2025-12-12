import { Logarhythm } from "logarhythm";
import { exhaustiveMatchGuard } from "@green-flash/ts-utils/isomorphic";

import {
  type TabuloEventMap,
  type TabuloColumnConfig,
  type TabuloColumnState,
  type TabuloExtendedState,
  type ManagerMutationOptions,
  type TabuloStateSort,
  mutateEngineStateHelper,
  type TabuloFilter,
  type TabuloRecord,
  type TabuloSort,
  type TabuloStateSortValue,
} from "./tabular-engine.utils.js";
import type { Tabulo } from "./Tabulo.js";

export type TabuloConfigSortValue = {
  /**
   * The labels that should be associated with asc|desc functionality
   */
  labelType: "A-Z|Z-A" | "ascending|descending";
  defaultValue?: TabuloStateSortValue | undefined;
};

export type TabuloConfigSort<S extends TabuloSort> = Record<
  S,
  TabuloConfigSortValue
>;

export type TabuloSortActions = {
  getValue: () => string | undefined;
  setValue: (
    value: TabuloStateSortValue | undefined,
    options?: ManagerMutationOptions
  ) => void;
  rotate: () => void;
};

export class TabuloManagerSort<
  R extends TabuloRecord,
  F extends TabuloFilter,
  S extends TabuloSort,
  C extends TabuloColumnConfig<R>,
  T extends TabuloColumnState<C>,
  X extends TabuloExtendedState = undefined,
  E extends TabuloEventMap = undefined
> {
  #engine: Tabulo<R, F, S, C, T, X, E>;
  #config: TabuloConfigSort<S> | undefined;
  #log: Logarhythm;
  entries: Map<
    S,
    TabuloSortActions & {
      config: TabuloConfigSortValue;
    }
  >;

  constructor(
    engine: Tabulo<R, F, S, C, T, X, E>,
    config?: TabuloConfigSort<S>
  ) {
    this.#engine = engine;
    this.#config = config ?? undefined;
    this.#log = new Logarhythm({
      name: `${engine.debugName}:engine-manager:sort`,
      pillColor: engine.debugColor,
    });
    this.entries = new Map();
    for (const [key, config] of Object.entries(this.#config ?? {})) {
      const sortKey = key as S;
      this.entries.set(sortKey, {
        config: config as TabuloConfigSortValue,
        getValue: () => {
          const state = this.#getSortState(sortKey);
          return state?.value ? state.value.toString() : undefined;
        },
        setValue: (value: TabuloStateSortValue | undefined, options) => {
          this.setSortValue(sortKey, value, options);
        },
        rotate: () => this.rotateSortValue(sortKey),
      });
    }
  }

  /**
   * Creates the initial state based upon the config
   */
  static createInitState<S extends TabuloSort>(
    config: TabuloConfigSort<S> | undefined
  ): TabuloStateSort<S> {
    return Object.keys(config ?? {}).reduce((accum, key) => {
      const sortKey = key as S;
      return {
        ...accum,
        [sortKey]: {
          value: config?.[sortKey]?.defaultValue ?? undefined,
        },
      };
    }, {} as TabuloStateSort<S>);
  }

  /**
   * Returns the configuration of all of the filters
   */
  getConfig() {
    return this.#config;
  }

  /**
   * Returns the configuration of a single sort configuration
   */
  getSortConfig(key: S) {
    return this.#config?.[key];
  }

  /**
   * Returns the configuration of a column as well
   * as scoped actions to operate on the column
   */
  getSort(key: S) {
    const sort = this.entries.get(key);
    if (!sort) {
      throw new Error(
        `Unable to find a sort entry for the "${String(
          key
        )}". Ensure that the sort you're trying to access is defined in the constructor of your tabular engine.`
      );
    }
    return sort;
  }

  /**
   * Clears all of the sorting values
   */
  async clearAll(options?: ManagerMutationOptions) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        this.#log.info("Clearing all sorting values");
        for (const sortKey of Object.keys(draft.sort ?? {})) {
          const key = sortKey as S;
          mutateEngineStateHelper(draft.sort, key, (sort) => {
            sort.value = undefined;
          });
        }
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("sort:change");
      },
    });
  }

  /**
   * Returns the current state of a provided sort key
   * Used internally to the class to ensure that a sort
   * value exists
   */
  #getSortState(key: S) {
    const sortState = this.#engine.getState().sort[key];
    if (!sortState) {
      throw new Error(
        `The sorting state for "${key}" is "undefined". Ensure that you're declaring it when instantiating the "${
          this.#engine.debugName
        }" engine.`
      );
    }
    return sortState;
  }

  /**
   * Set's the value of a provided sort key
   */
  async setSortValue(
    key: S,
    value: TabuloStateSortValue | undefined,
    options?: ManagerMutationOptions
  ) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        this.#log.info("Setting sort value", { sortKey: key, value });
        mutateEngineStateHelper(draft.sort, key, (sort) => {
          sort.value = value;
        });
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("sort:change");
      },
    });
  }

  /**
   * Get's the value of a provided sort key
   */
  getSortValue(key: S) {
    const sortState = this.#engine.getState().sort;
    return sortState[key].value;
  }

  clearSortValue(key: S, options?: ManagerMutationOptions) {
    this.setSortValue(key, undefined, options);
  }

  /**
   * Rotate the value of a sort key from `ascending` -> `descending` -> `undefined`
   */
  rotateSortValue(key: S, options?: ManagerMutationOptions) {
    const sortValue = this.getSortValue(key);
    if (!sortValue) {
      return this.setSortValue(key, "ascending", options);
    }
    switch (sortValue) {
      case "ascending":
        return this.setSortValue(key, "descending", options);

      case "descending":
        return this.clearSortValue(key, options);

      default:
        return exhaustiveMatchGuard(sortValue);
    }
  }

  /**
   * Returns a normalized state key value pair record that has the signature.
   * This will filter out any sorting state that is `undefined`
   * of `{ [SortKey]: "ascending" | "descending" }`
   */
  normalizeState(): Partial<Record<S, TabuloStateSortValue>> {
    const state = this.#engine.getState().sort;
    const normalizedState = Object.keys(state).reduce<
      Partial<Record<S, TabuloStateSortValue>>
    >((accum, key) => {
      const sortKey = key as S;
      const sortState = state[sortKey];
      if (typeof sortState.value === "undefined") return accum;
      return Object.assign(accum, { [key]: sortState.value });
    }, {} as Partial<Record<S, TabuloStateSortValue>>);
    return normalizedState;
  }
}
