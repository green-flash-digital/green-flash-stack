import type { ToastOptions, ToastProps, ToastState } from "@stratum-ui/core";
import { ToastEngine } from "@stratum-ui/core";
import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

export class Toast<T extends ToastProps> extends ToastEngine<T> {
  #ToastComponent: (props: ToastState<T>) => ReactNode;

  constructor(
    options: ToastOptions & {
      ToastComponent: (props: ToastState<T>) => ReactNode;
    }
  ) {
    super(options);
    this.#ToastComponent = options.ToastComponent;
  }

  Render() {
    return (
      <ToastRenderer<T> engine={this} ToastComponent={this.#ToastComponent} />
    );
  }
}

function ToastRenderer<T extends ToastProps>({
  engine,
  ToastComponent,
}: {
  engine: Toast<T>;
  ToastComponent: (props: ToastState<T>) => ReactNode;
}) {
  const toasts = useSyncExternalStore(engine.subscribe, engine.getState);
  const regionPolite = engine.getRegionPolite();
  const regionAssertive = engine.getRegionAssertive();

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
