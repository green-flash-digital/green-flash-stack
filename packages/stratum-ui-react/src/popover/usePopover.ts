import type { ComponentType } from "react";
import { lazy, useEffect, useState, useSyncExternalStore } from "react";

import type { PopoverEngineOptions, PopoverEngineState } from "@stratum-ui/core";
import { PopoverEngine } from "@stratum-ui/core";

export type UsePopoverOptions = PopoverEngineOptions & {
  /**
   * Optional lazily-loaded content via dynamic import — the component is created
   * once for this hook instance's lifetime. If you don't need code-splitting,
   * just render your own content as children instead; this is purely a
   * convenience for the common case.
   * @example
   *   load: () => import("./MyPopoverContent")
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  load?: () => Promise<{ default: ComponentType<any> }>;
};

/**
 * React binding for `PopoverEngine`. Creates one engine instance per hook call,
 * scoped to that component instance's own lifetime — unlike Modal's
 * singleton-controller-per-kind pattern, popovers/menus/tooltips are usually
 * co-located with their trigger and often need many independent instances at
 * once (e.g. one per row in a list), which a module-level singleton can't
 * represent. Use this directly for a bespoke popover, or as the basis for a
 * more specific hook like `useMenu`/`useTooltip`.
 *
 * The popover container is expected to render persistently (not conditionally
 * on `isOpen`) — see `PopoverEngine`'s `isClosing` docs for why. Use
 * `shouldRenderContent` to decide whether to render children: it stays `true`
 * through the close animation, unlike `state.isOpen` which flips the instant a
 * close begins. If you'd rather unmount immediately on close (no need to wait
 * for the exit transition to finish), key off `state.isOpen` directly instead —
 * both are legitimate, it's just a choice about what a given popover should do.
 */
export function usePopover<S extends PopoverEngineState | undefined = undefined>(
  options: UsePopoverOptions = {}
) {
  const { load, ...engineOptions } = options;
  const [engine] = useState(() => new PopoverEngine<S>(engineOptions));
  const state = useSyncExternalStore(engine.subscribe, engine.getState, engine.getState);
  const [Content] = useState(() => (load ? lazy(load) : undefined));

  useEffect(() => () => engine.destroy(), [engine]);

  return {
    engine,
    state,
    /** True while open AND while closing (until the exit transition finishes). */
    shouldRenderContent: state.isOpen || state.isClosing,
    popoverRef: engine.onMount,
    open: engine.openPopover,
    close: engine.closePopover,
    toggle: engine.togglePopover,
    /** The lazily-loaded content component, if `load` was provided. */
    Content,
    /** Kick off `load` early — call from onMouseEnter/onFocus to hide latency. */
    preload: load
  };
}
