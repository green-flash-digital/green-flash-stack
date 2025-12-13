import type { ToastOptions, ToastProps, ToastState } from "@stratum-ui/core";
import { ToastEngine } from "@stratum-ui/core";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

export class Toaster<T extends ToastProps> extends ToastEngine<T> {
  #ToastComponent: (props: ToastState<T>) => ReactNode;

  constructor(
    options: ToastOptions & {
      ToastComponent: (props: ToastState<T>) => ReactNode;
    }
  ) {
    super(options);
    this.#ToastComponent = options.ToastComponent;
    this.Render = this.Render.bind(this);
  }

  Render() {
    const Component = this.#ToastComponent;
    return <ToastRenderer<T> engine={this} ToastComponent={Component} />;
  }
}

function ToastRenderer<T extends ToastProps>({
  engine,
  ToastComponent,
}: {
  engine: Toaster<T>;
  ToastComponent: (props: ToastState<T>) => ReactNode;
}) {
  const toasts = useSyncExternalStore(
    engine.subscribe,
    engine.getState,
    engine.getState
  );

  const regionPolite = engine.getRegionPolite();
  const regionAssertive = engine.getRegionAssertive();

  useEffect(() => {
    return () => {
      engine.destroy();
    };
  }, [engine]);

  return (
    <>
      {createPortal(
        toasts.map((toast, i) => {
          if (engine.getToastType(toast) !== "polite") return null;
          return <ToastComponent key={i} {...toast} />;
        }),
        regionPolite
      )}
      {createPortal(
        toasts.map((toast, i) => {
          if (engine.getToastType(toast) !== "assertive") return null;
          return <ToastComponent key={i} {...toast} />;
        }),
        regionAssertive
      )}
    </>
  );
}
