import { Logarhythm } from "logarhythm";

import type { Tabulo } from "./Tabulo.js";
import type {
  ManagerMutationOptions,
  TabuloColumnConfig,
  TabuloColumnState,
  TabuloEventMap,
  TabuloExtendedState,
  TabuloFilter,
  TabuloRecord,
  TabuloSort,
  TabuloStateRecord
} from "./tabulo.utils.js";

export type TabuloConfigRecords = Pick<TabuloStateRecord, "selectable"> & {
  defaultSelected?: TabuloStateRecord["selected"] | undefined;
};

export class TabuloManagerRecords<
  R extends TabuloRecord,
  F extends TabuloFilter,
  S extends TabuloSort,
  C extends TabuloColumnConfig<R>,
  T extends TabuloColumnState<C>,
  X extends TabuloExtendedState = undefined,
  E extends TabuloEventMap = undefined
> {
  #engine: Tabulo<R, F, S, C, T, X, E>;
  #log: Logarhythm;
  #config: TabuloConfigRecords | undefined;

  constructor(engine: Tabulo<R, F, S, C, T, X, E>, config?: TabuloConfigRecords) {
    this.#engine = engine;
    this.#config = config;
    this.#log = new Logarhythm({
      name: `${engine.debugName}:engine-manager:records`,
      pillColor: engine.debugColor
    });

    this.selectAll = this.selectAll.bind(this);
    this.deselectAll = this.deselectAll.bind(this);
    this.select = this.select.bind(this);
    this.deselect = this.deselect.bind(this);
  }

  /**
   * Creates the initial state based upon the config
   * during construction
   */
  static createInitState(config: TabuloConfigRecords | undefined): TabuloStateRecord {
    return {
      selectable: config?.selectable ?? false,
      selected: config?.defaultSelected ?? []
    };
  }

  get #loadedRecordIds() {
    const records = this.#getData().records ?? [];
    if (records.length === 0) return [];
    return records.reduce<R["id"][]>((accum, record) => {
      if (typeof record?.id === "undefined") return accum;
      return accum.concat(record.id);
    }, []);
  }

  #getData() {
    return this.#engine.getState().data;
  }

  /**
   * Returns the configuration of the records
   */
  getConfig() {
    return this.#config;
  }

  /**
   * Returns the number of records that are loaded to be selected
   */
  getNumberOfSelectableRecords() {
    return this.#loadedRecordIds.length;
  }

  /**
   * Returns an array of record ids loaded into the state
   */
  getLoadedRecordIds() {
    return this.#loadedRecordIds;
  }

  /**
   * Singular method to get the records that have been selected
   */
  getSelected() {
    return this.#engine.getState().records.selected;
  }

  /**
   * Returns a list of the fully qualified selected records
   * associated with the selected record ids.
   */
  getFullRecordsFromSelectedIds(): R[] {
    const records = this.#getData().records ?? [];
    const state = this.#engine.getState().records;
    const selectedRecordIds = state.selected;
    return selectedRecordIds.map((selectedId) => {
      const foundRecord = records.find((record) => record.id === selectedId);
      if (!foundRecord) {
        throw `Cannot find the fully qualified record associated with the selected record: ${selectedId}. This should not have happened. Please contact support.`;
      }
      return foundRecord;
    });
  }

  /**
   * Helper method to determine if a record is selected
   * or not. Helpful when determine the state of various UI
   * controls associated wth selecting a record
   */
  isSelected(recordId: number) {
    const state = this.#engine.getState().records;
    const isSelected = state.selected.includes(recordId);
    return isSelected;
  }

  /**
   * Helper method to determine if all of the records are selected
   */
  areAllSelected() {
    const state = this.#engine.getState().records;
    return (
      state.selected.length === this.#loadedRecordIds.length && this.#loadedRecordIds.length !== 0
    );
  }

  /**
   * Helper method to be able to surface UI controls
   * for the user to be able to select records
   */
  canBeSelected() {
    const state = this.#engine.getState().records;
    return state.selectable;
  }

  /**
   * Selects a record or an array of records. If a record is already
   * selected it will skip over adding it
   */
  async select(singleOrMany: number | (number | string)[], options?: ManagerMutationOptions) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        const records = typeof singleOrMany === "number" ? [singleOrMany] : singleOrMany;
        for (const record of records) {
          const selected = Number(record);
          if (draft.records.selected.includes(selected)) continue;

          this.#log.debug("Selecting record", selected);
          draft.records.selected.push(selected);
        }

        const totalSelectedRecords = draft.records.selected.length;
        const totalRecords = (draft.data.records ?? []).length;

        if (totalSelectedRecords === totalRecords) {
          this.#log.debug("Total selected records now equals number of records");
          this.selectAll(options);
        }
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("records:select");
      }
    });
  }

  /**
   * Selects or deselects a record based upon
   * the checked value
   */
  toggle(recordId: number, checked: boolean, options?: ManagerMutationOptions) {
    if (checked) {
      return this.select(recordId, options);
    }
    return this.deselect(recordId, options);
  }

  /**
   * Unselect a record
   */
  async deselect(recordId: number, options?: ManagerMutationOptions) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        this.#log.debug("Deselecting record", recordId);
        const recordIndex = draft.records.selected.findIndex(
          (selectedId) => selectedId === recordId
        );

        // Splice out the record from the selected records
        draft.records.selected.splice(recordIndex, 1);
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("records:deselect");
      }
    });
  }

  /**
   * Select all of the records
   */
  async selectAll(options?: ManagerMutationOptions) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        this.#log.info("Selecting all records", this.#loadedRecordIds.length);
        draft.records.selected = [...this.#loadedRecordIds];
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("records:select");
      }
    });
  }

  /**
   * Unselect all of the records
   */
  async deselectAll(options?: ManagerMutationOptions) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        this.#log.info("Deselecting all records");
        // Remove the records that are loaded in the table from
        // the selected id
        for (const recordId of this.#loadedRecordIds) {
          const selectedRecordIdIndex = draft.records.selected.indexOf(recordId);
          if (selectedRecordIdIndex === -1) continue;
          draft.records.selected.splice(selectedRecordIdIndex, 1);
        }
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("records:deselect");
      }
    });
  }

  /**
   * Allows the ability to select rows
   */
  async enableRecordSelection(options?: ManagerMutationOptions) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        draft.records.selectable = true;
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("records:selection:enable");
      }
    });
  }

  /**
   * Prevents the ability to select rows
   */
  async disableRecordSelection(options?: ManagerMutationOptions) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        draft.records.selectable = false;
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("records:selection:disable");
      }
    });
  }
}
