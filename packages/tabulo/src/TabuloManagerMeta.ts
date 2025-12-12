import { Logarhythm } from "logarhythm";

import type {
  ManagerMutationOptions,
  TabuloColumnConfig,
  TabuloColumnState,
  TabuloEventMap,
  TabuloExtendedState,
  TabuloFilter,
  TabuloRecord,
  TabuloSort,
} from "./tabulo.utils.js";
import type { Tabulo } from "./Tabulo.js";

export type TabuloConfigMeta = {
  messages: {
    /**
     * The message that displays when the data grid has been successfully
     * loaded, records exist, but none match the table state.
     * @default "No results"
     */
    noResults?: string | (() => unknown);
    /**
     * The message that displays when the data grid has been successfully
     * loaded, and no records exist in the DB to show regardless of table state
     * @default "No records"
     */
    noRecords: string | (() => unknown);
  };
};

export class TabuloManagerMeta<
  R extends TabuloRecord,
  F extends TabuloFilter,
  S extends TabuloSort,
  C extends TabuloColumnConfig<R>,
  T extends TabuloColumnState<C>,
  X extends TabuloExtendedState = undefined,
  E extends TabuloEventMap = undefined
> {
  #engine: Tabulo<R, F, S, C, T, X, E>;
  #config: {
    messages: Required<TabuloConfigMeta["messages"]>;
  };
  #log: Logarhythm;

  constructor(engine: Tabulo<R, F, S, C, T, X, E>, config?: TabuloConfigMeta) {
    this.#engine = engine;
    this.#config = {
      ...config,
      messages: {
        noResults: config?.messages?.noResults ?? "global.no_search_results",
        noRecords: config?.messages?.noRecords ?? "global.no_records_exist",
      },
    };
    this.#log = new Logarhythm({
      name: `${engine.debugName}:engine-manager:meta`,
      pillColor: engine.debugColor,
    });
  }

  getConfig() {
    return this.#config;
  }

  getMessages() {
    return this.#config.messages;
  }

  /**
   * Method to forcefully update the UI via state
   * by changing the tick value back and fourth from
   * 0 to 1. Declarative libraries that rely on the shape of
   * state to update would need this if nothing has changed
   * but we still want to force an update
   */
  async tick(options?: ManagerMutationOptions) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        this.#log.trace("ticking...");
        draft.meta.tick = draft.meta.tick ? 0 : 1;
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("meta:tick");
      },
    });
  }
}
