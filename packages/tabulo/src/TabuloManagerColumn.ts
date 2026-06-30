import type { ChangeEvent, ReactNode } from "react";
import type React from "react";
import type { ObjectDotNotation } from "@green-flash/ts-utils/isomorphic";
import { Logarhythm } from "logarhythm";

import {
  type TabuloStateColumnValue,
  type TabuloEventMap,
  type TabuloExtendedState,
  type ManagerMutationOptions,
  type TabuloColumnConfig,
  type TabuloColumnState,
  type TabuloSort,
  type TabuloRecord,
  type TabuloFilter,
  mutateEngineStateHelper,
} from "./tabulo.utils.js";
import type { Tabulo } from "./Tabulo.js";

export type TabuloColumnActions = {
  isVisible: () => boolean;
  hide: () => Promise<void>;
  show: () => Promise<void>;
  toggle: () => Promise<void> | undefined;
  /**
   * A handler that can be attached to a input onChange
   * event. This method assumes that the name of the input
   * is the colId.
   */
  onToggle: (e: ChangeEvent<HTMLInputElement>) => Promise<void> | undefined;
  setVisible: (isVisible: boolean, options?: ManagerMutationOptions) => void;
};

type TabuloConfigColumnHeadShared = {
  props?: { [key: string]: unknown } & {
    /**
     * Override any of the computed styles directly. These can be considered the
     * most important styles that will be applied to the header td cell
     */
    style?: React.CSSProperties;
  };
};

export type TabuloConfigColumnHeadCustom = TabuloConfigColumnHeadShared & {
  type: "custom";
  value: () => ReactNode;
};
export type TabuloConfigColumnHeadText = TabuloConfigColumnHeadShared & {
  type: "text";
  /**
   * The column head text translation key
   */
  i18nKey: string | undefined;
};

export type TabuloConfigColumnCellProps = {
  justify?: TabuloConfigColumnLayoutJustify;
};
export type TabuloConfigColumnCellAccessor<R extends TabuloRecord> = {
  type: "accessor";
  value: ObjectDotNotation<R>;
  props?: TabuloConfigColumnCellProps;
};
export type TabuloConfigColumnCellDisplay<R extends TabuloRecord> = {
  type: "display";
  value: (record: R) => ReactNode;
  props?: TabuloConfigColumnCellProps;
};
export type TabuloConfigColumnCell<R extends TabuloRecord> =
  | TabuloConfigColumnCellAccessor<R>
  | TabuloConfigColumnCellDisplay<R>;

export type TabuloConfigColumnLayoutJustify = "left" | "center" | "right";
export type TabuloConfigColumnLayout = {
  /**
   * Freezes the column to the 'left' or 'right' side of the table
   */
  freeze?: "left" | "right";
  justify?: TabuloConfigColumnLayoutJustify;
  style?: React.CSSProperties;
};

export type TabuloConfigColumnValue<R extends TabuloRecord> = {
  layout?: TabuloConfigColumnLayout;
  header: TabuloConfigColumnHeadCustom | TabuloConfigColumnHeadText;

  cell: TabuloConfigColumnCell<R>;
  defaults?: Partial<TabuloStateColumnValue>;
};

export class TabuloManagerColumn<
  R extends TabuloRecord,
  F extends TabuloFilter,
  S extends TabuloSort,
  C extends TabuloColumnConfig<R>,
  T extends TabuloColumnState<C>,
  X extends TabuloExtendedState = undefined,
  E extends TabuloEventMap = undefined
> {
  #engine: Tabulo<R, F, S, C, T, X, E>;
  #config: C;
  #log: Logarhythm;
  #columns: Map<
    keyof C,
    TabuloColumnActions & {
      id: keyof C;
      config: TabuloConfigColumnValue<R>;
    }
  >;
  entries: Array<
    [
      keyof C,
      TabuloColumnActions & {
        id: keyof C;
        config: TabuloConfigColumnValue<R>;
      }
    ]
  >;

  constructor(engine: Tabulo<R, F, S, C, T, X, E>, config: C) {
    this.#engine = engine;
    this.#config = config;
    this.#log = new Logarhythm({
      name: `${this.#engine.debugName}:engine-manager:column`,
      pillColor: this.#engine.debugColor,
    });
    this.#columns = new Map();
    for (const [colId, config] of Object.entries(this.#config ?? {})) {
      this.#columns.set(colId as keyof C, {
        config,
        id: colId,
        isVisible: () => this.isColumnVisible(colId),
        hide: () => this.hideColumn(colId),
        show: () => this.showColumn(colId),
        toggle: () => {
          const isVisible = this.isColumnVisible(colId);
          if (isVisible) return this.hideColumn(colId);
          this.showColumn(colId);
        },
        setVisible: (isVisible, options) => {
          if (isVisible) {
            this.showColumn(colId, options);
          } else {
            this.hideColumn(colId, options);
          }
        },
        /**
         * A handler that can be attached to a input onChange
         * event. This method assumes that the name of the input
         * is the colId.
         */
        onToggle: (e: ChangeEvent<HTMLInputElement>) => {
          const isChecked = e.currentTarget.checked;
          if (isChecked) return this.showColumn(colId);
          this.hideColumn(colId);
        },
      });
    }
    this.entries = [...this.#columns.entries()];
  }

  /**
   * Creates the initial state based upon the config
   */
  static createInitState<
    R extends TabuloRecord,
    C extends TabuloColumnConfig<R>,
    T extends TabuloColumnState<C>
  >(config: C): T {
    return Object.entries(config).reduce<T>((accum, [colId, col]) => {
      return {
        ...accum,
        [colId]: { isVisible: col.defaults?.isVisible ?? true },
      };
    }, {} as T);
  }

  /**
   * Returns the number of columns that have been configured
   */
  get length() {
    return Object.keys(this.#config).length;
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
  getColumn<K extends keyof C>(key: K) {
    const column = this.#columns.get(key);
    if (!column) {
      throw new Error(
        `Unable to find a column entry for the "${String(
          key
        )}". Ensure that the column you're trying to access is defined in the constructor of your tabular engine.`
      );
    }
    return column;
  }

  /**
   * Returns the visibility a specific column
   */
  isColumnVisible<K extends keyof C>(key: K) {
    return this.#engine.getState().columns[key].isVisible;
  }

  /**
   * Hides a column
   */
  async hideColumn<K extends keyof C>(
    key: K,
    options?: ManagerMutationOptions
  ) {
    await this.#engine.queueStateUpdate({
      mutate: (draft) => {
        this.#log.info("Hiding column", key);
        mutateEngineStateHelper<T>(draft.columns, key, (column) => {
          column.isVisible = false;
        });
      },
      ...options,
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("column:change", {
          columnId: key.toString(),
          isVisible: false,
        });
      },
    });
  }

  /**
   * Displays a column
   */
  async showColumn<K extends keyof C>(
    key: K,
    options?: ManagerMutationOptions
  ) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        this.#log.info("Showing column", key);
        mutateEngineStateHelper<T>(draft.columns, key, (column) => {
          column.isVisible = true;
        });
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("column:change", {
          columnId: key.toString(),
          isVisible: true,
        });
      },
    });
  }

  /**
   * Toggles the visibility of some columns
   */
  async showHide<K extends keyof T>(
    colVis: Record<K, boolean>,
    options?: ManagerMutationOptions
  ) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        for (const key of Object.keys(colVis)) {
          const colKey = key as K;
          const isVisible = colVis[colKey];

          this.#log.info("Toggling visibility of column", {
            col: colKey,
            isVisible,
          });
          mutateEngineStateHelper<T>(draft.columns, colKey, (column) => {
            column.isVisible = isVisible;
          });
        }
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("columns:change");
      },
    });
  }

  /**
   * Displays every column
   */
  async showAll(options?: ManagerMutationOptions) {
    await this.#engine.queueStateUpdate({
      mutate: (draft) => {
        this.#log.info("Showing all columns");
        for (const colId of Object.keys(draft.columns)) {
          mutateEngineStateHelper<T>(draft.columns, colId, (column) => {
            column.isVisible = true;
          });
        }
      },
      ...options,
      onAfterCommit: () => {
        if (options?.emit) return;
        this.#engine.emit("columns:change");
      },
    });
  }
}
