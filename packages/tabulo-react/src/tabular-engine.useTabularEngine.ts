import { useSyncExternalStore } from "react";

import type { Tabulo } from "tabulo";

/**
/**
 * React hook for subscribing to state changes in a Tabulo engine instance.
 *
 * This hook uses React's useSyncExternalStore to keep your React component
 * in sync with the external state managed by a Tabulo engine. On every engine
 * state update, the component using this hook will re-render with the latest state.
 * 
 * Note: The generics for Tabulo use `any` because this hook is designed to work
 * with any Tabulo instance, regardless of its specific row/filter/sort/etc types. 
 * This maximizes compatibility with a variety of Tabulo engine parameterization.
 *
 * Usage:
 * ```tsx
 * import { useTabulo } from "tabulo-react";
 *
 * function TableView({ engine }) {
 *   const { state, engine } = useTabulo(engine);
 *   // render UI based on state
 * }
 * ```
 */
export function useTabulo<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E extends Tabulo<any, any, any, any, any, any, any>
>(engine: E) {
  const state = useSyncExternalStore<ReturnType<E["getState"]>>(
    engine.subscribe,
    engine.getState,
    engine.getState
  );
  return { state, engine };
}
