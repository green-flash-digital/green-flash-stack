import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import type { ToastOptions, ToastProps, ToastState } from "@stratum-ui/core";
import { ToastEngine } from "@stratum-ui/core";
import type { JSX } from "react/jsx-runtime";

export type ToastContainerProps = Omit<JSX.IntrinsicElements["div"], "ref">;

export type ToasterOptions<T extends ToastProps> = ToastOptions & {
  ToastComponent: (props: ToastState<T>) => ReactNode;
  containerProps?: ToastContainerProps;
};

/**
 * A React-specific adapter for the Stratum ToastEngine, responsible for managing toast notification logic and rendering within React applications.
 *
 * The `Toaster` class extends the core toast engine with the following capabilities:
 *   - Accepts a React component (`ToastComponent`) for rendering each individual toast notification.
 *   - Handles container-level props and customization for the toast region in the DOM via `containerProps`.
 *   - Provides a ready-to-use `.Render()` method for React components, which handles the creation of the toast container and the orchestration of rendering toast list updates.
 *   - Inherits all toast lifecycle and state management functionality from `ToastEngine` (including accessibility and ARIA live-region features).
 *
 * **Usage:**
 *   - Typically, you create an instance of `Toaster` and invoke its `.Render()` method in your component tree to enable toast rendering.
 *   - To present a toast, use methods like `.success(props)`, `.error(props)`, etc., inherited from `ToastEngine`.
 *
 * **Example:**
 *   ```tsx
 *   const toaster = new Toaster({
 *     ToastComponent: ({ message }) => <div>{message}</div>,
 *     toastDuration: 5,
 *     containerProps: { className: "my-toast-container" }
 *   });
 *
 *   function App() {
 *     return (
 *       <>
 *         <toaster.Render />
 *         <button onClick={() => toaster.success({ message: "Success!" })}>Notify</button>
 *       </>
 *     );
 *   }
 *   ```
 */
export class Toaster<T extends ToastProps> extends ToastEngine<T> {
  #ToastComponent: (props: ToastState<T>) => ReactNode;
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
  ToastComponent: (props: ToastState<T>) => ReactNode;
} & ToasterOptions<T>["containerProps"]) {
  const toasts = useSyncExternalStore(engine.subscribe, engine.getState, engine.getState);
  const hostRef = useRef<HTMLDivElement | null>(null);
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
   * Ensures the toast container appears above all other UI elements (such as dialogs and modals)
   * by programmatically hiding and re-showing the popover whenever the number of active toasts changes.
   *
   * This effectively bumps the container to the highest position in the popover/top-layer stacking context,
   * resolving issues where toasts might otherwise be visually obscured by overlays or other system dialogs.
   * If there are no active toasts, the popover is hidden so it does not interfere with screen readers or keyboard navigation.
   * This effect is triggered on every change to the length of the toasts array.
   */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // If already open, "bump" it to be last in top-layer order.
    // (hide+show is the reliable bump across implementations)
    if (host.matches(":popover-open")) host.hidePopover();
    if (toasts.length === 0) {
      return host.hidePopover();
    }
    host.showPopover();
  }, [toasts.length]); // or a toast revision counter if you have one

  useEffect(() => {
    return () => {
      engine.destroy();
    };
  }, [engine]);

  return createPortal(
    <div {...containerProps} ref={hostRef} popover="manual" tabIndex={-1} role="presentation">
      {/* Live regions: ONLY place text/announcements here */}
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

      {/* Visual stack should NOT be a live region */}
      <div aria-hidden="true" style={{ display: "contents" }}>
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} {...toast} />
        ))}
      </div>
    </div>,
    document.body
  );
}
