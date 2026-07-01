import { castDraft, current } from "immer";
import { Logarhythm } from "logarhythm";

import type { Tabulo } from "./Tabulo.js";
import type {
  TabuloStateGroup,
  TabuloRecord,
  TabuloFilter,
  TabuloSort,
  ManagerMutationOptions,
  TabuloColumnConfig,
  TabuloColumnState,
  TabuloExtendedState,
  TabuloEventMap
} from "./tabulo.utils.js";

export type TabuloConfigGroup<R extends TabuloRecord> = TabuloStateGroup<R>;

export class TabuloManagerGroup<
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
  #config: TabuloConfigGroup<R> | undefined;

  constructor(engine: Tabulo<R, F, S, C, T, X, E>, config?: TabuloConfigGroup<R>) {
    this.#engine = engine;
    this.#config = config;
    this.#log = new Logarhythm({
      name: `${this.#engine.debugName}:engine-manager:group`,
      pillColor: this.#engine.debugColor
    });

    this.setGrouping = this.setGrouping.bind(this);
  }

  /**
   * Creates the initial state based upon the config
   */
  static createInitState<R extends TabuloRecord>(
    config: TabuloConfigGroup<R> | undefined
  ): TabuloStateGroup<R> | undefined {
    return config;
  }

  /**
   * Returns the configuration of the grouping
   */
  getConfig() {
    return this.#config;
  }

  /**
   * Set's a well formed grouping state by requiring you to
   * set the key to group as well as the function that
   * determines how that key value is displayed.
   */
  async setGrouping({ key, ...restArgs }: TabuloStateGroup<R>, options?: ManagerMutationOptions) {
    await this.#engine.queueStateUpdate({
      ...options,
      mutate: (draft) => {
        this.#log.info("Updating grouping to group by", key);
        draft.group = castDraft({
          ...castDraft(draft.group ?? {}),
          ...restArgs,
          key
        });
        const currentState = current(draft);
        if (!currentState.group?.renderFn) {
          this.#log.warn(
            "There is no `renderFn` associated with this grouping key. Add a `renderFn` to declaratively tell your UI logic how to render your grouping."
          );
        }
      },
      onAfterCommit: () => {
        const emit = options?.emit ?? true;
        if (!emit) return;
        this.#engine.emit("group:change");
      }
    });
  }
}
