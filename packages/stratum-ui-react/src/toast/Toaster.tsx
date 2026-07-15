import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";

import type { ToastOptions, ToastProps, ToastState } from "@stratum-ui/core";
import { ToastEngine } from "@stratum-ui/core";
import type { JSX } from "react/jsx-runtime";

export type ToastContainerProps = Omit<JSX.IntrinsicElements["div"], "ref">;

/**
 * What a `ToastComponent` actually receives: the stored toast state (message,
 * variant, id, duration, any custom props) plus three bound callbacks —
 * `close`/`pause`/`resume` are per-toast closures created at render time, not
 * part of the engine's stored state itself (functions don't belong in
 * `TransactionStore`'s Immer-managed state).
 */
export type ToastComponentProps<T extends ToastProps = ToastProps> = ToastState<T> & {
  /** Dismisses this toast immediately — wire to a close (×) button. */
  close: () => void;
  /** Pauses this toast's auto-dismiss timer — wire to `onMouseEnter`/`onFocus`. */
  pause: () => void;
  /** Resumes this toast's auto-dismiss timer for whatever time was left — wire to `onMouseLeave`/`onBlur`. */
  resume: () => void;
};

export type ToasterOptions<T extends ToastProps> = ToastOptions & {
  ToastComponent: (props: ToastComponentProps<T>) => ReactNode;
  containerProps?: ToastContainerProps;
};

/**
 * A React-specific adapter for the Stratum ToastEngine, responsible for managing toast notification logic and rendering within React applications.
 *
 * The `Toaster` class extends the core toast engine with the following capabilities:
 *   - Accepts a React component (`ToastComponent`) for rendering each individual toast notification.
 *   - Handles container-level props and customization for the toast region in the DOM via `containerProps`.
 *   - Provides a ready-to-use `.Render()` method for React components, which handles the creation of the toast container and the orchestration of rendering toast list updates.
 *   - Inherits all toast lifecycle and state management functionality from `ToastEngine` (including accessibility and ARIA live-region attributes).
 *
 * **Usage:** instantiate once — typically named `Toast` — and call it from anywhere:
 *   ```tsx
 *   export const Toast = new Toaster({
 *     ToastComponent: ({ message }) => <div>{message}</div>,
 *     toastDuration: 5
 *   });
 *
 *   function App() {
 *     return (
 *       <>
 *         <Toast.Render />
 *         <button onClick={() => Toast.success({ message: "Success!" })}>Notify</button>
 *       </>
 *     );
 *   }
 *   ```
 */
export class Toaster<T extends ToastProps> extends ToastEngine<T> {
  #ToastComponent: (props: ToastComponentProps<T>) => ReactNode;
  #containerProps: ToastContainerProps;

  constructor(options: ToasterOptions<T>) {
    super(options);
    this.#containerProps = options.containerProps ?? {};
    this.#ToastComponent = options.ToastComponent;
    this.Render = this.Render.bind(this);
  }

  Render() {
    const containerProps = this.#containerProps;
    return (
      <ToastRenderer<T> engine={this} ToastComponent={this.#ToastComponent} {...containerProps} />
    );
  }
}

function ToastRenderer<T extends ToastProps>({
  engine,
  ToastComponent,
  ...containerProps
}: {
  engine: Toaster<T>;
  ToastComponent: (props: ToastComponentProps<T>) => ReactNode;
} & ToasterOptions<T>["containerProps"]) {
  const toasts = useSyncExternalStore(engine.subscribe, engine.getState, engine.getState);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const previousLengthRef = useRef(0);
  const regionProps = useMemo(() => engine.getRegionAttributes({ toKebabCase: true }), [engine]);
  const srOnly = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: 0,
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      clipPath: "inset(50%)",
      whiteSpace: "nowrap",
      border: 0
    }),
    []
  );

  /**
   * Ensures the toast container appears above all other UI elements (such as
   * dialogs and modals) by re-bumping it to the top of the top-layer stacking
   * order whenever a *new* toast is added while it's already open (hide+show
   * is the reliable bump across implementations). Only bumps on growth — not
   * on every length change — since re-bumping when a toast is *removed* (e.g.
   * an auto-dismiss timer firing while others are still visible) would
   * needlessly hide and re-show the whole stack, flickering toasts that
   * aren't even changing.
   */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const previousLength = previousLengthRef.current;
    previousLengthRef.current = toasts.length;

    if (toasts.length === 0) {
      if (host.matches(":popover-open")) host.hidePopover();
      return;
    }

    if (toasts.length > previousLength && host.matches(":popover-open")) {
      host.hidePopover();
    }
    if (!host.matches(":popover-open")) {
      host.showPopover();
    }
  }, [toasts.length]);

  useEffect(() => {
    return () => {
      engine.destroy();
    };
  }, [engine]);

  return (
    <>
      {/* Live regions: deliberately NOT inside the popover-bumped container
          below. That container gets hidden+shown to re-order it in the
          top-layer stack at the exact moment a new toast arrives — hiding a
          live region's own element while adding the content it's meant to
          announce risks the announcement being missed. These stay mounted,
          visible-to-AT, and untouched by that stacking mechanism. */}
      <div {...regionProps.polite} style={srOnly}>
        {toasts
          .filter((t) => engine.getToastType(t) === "polite")
          .map((t) => (
            <div key={t.id}>{t.message}</div>
          ))}
      </div>
      <div {...regionProps.assertive} style={srOnly}>
        {toasts
          .filter((t) => engine.getToastType(t) === "assertive")
          .map((t) => (
            <div key={t.id}>{t.message}</div>
          ))}
      </div>

      {/* Visual stack only. `popover="manual"` alone promotes this to the top
          layer — rendering above any clipping/z-index ancestor regardless of
          where it sits in the tree, so there's no need to additionally portal
          it to document.body. Safe to hide/show freely for stacking purposes
          since everything inside is aria-hidden. */}
      <div {...containerProps} ref={hostRef} popover="manual" tabIndex={-1} role="presentation">
        <div aria-hidden="true" style={{ display: "contents" }}>
          {toasts.map((toast) => (
            <ToastComponent
              key={toast.id}
              {...toast}
              close={() => engine.remove(toast.id)}
              pause={() => engine.pause(toast.id)}
              resume={() => engine.resume(toast.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
