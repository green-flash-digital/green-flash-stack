import type { ToastOptions, ToastProps, ToastState } from "@stratum-ui/core";
import { ToastEngine } from "@stratum-ui/core";
import {
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type ToasterOptions<T extends ToastProps> = ToastOptions & {
  containerClassName?: string;
  ToastComponent: (props: ToastState<T>) => ReactNode;
};

export class Toaster<T extends ToastProps> extends ToastEngine<T> {
  #ToastComponent: (props: ToastState<T>) => ReactNode;
  #className: string | undefined;

  constructor(options: ToasterOptions<T>) {
    super(options);
    this.#className = options.containerClassName;
    this.#ToastComponent = options.ToastComponent;
    this.Render = this.Render.bind(this);
  }

  Render() {
    return (
      <ToastRenderer<T>
        engine={this}
        ToastComponent={this.#ToastComponent}
        className={this.#className}
      />
    );
  }
}

function ToastRenderer<T extends ToastProps>({
  engine,
  className,
  ToastComponent,
}: {
  engine: Toaster<T>;
  className?: string;
  ToastComponent: (props: ToastState<T>) => ReactNode;
}) {
  const toasts = useSyncExternalStore(
    engine.subscribe,
    engine.getState,
    engine.getState
  );
  const regionAttributes = useMemo(
    () => engine.getRegionAttributes(),
    [engine]
  );

  useEffect(() => {
    return () => {
      engine.destroy();
    };
  }, [engine]);

  return createPortal(
    <div className={className}>
      <div {...regionAttributes.polite}>
        {toasts
          .filter((toast) => engine.getToastType(toast) === "polite")
          .map((toast) => (
            <ToastComponent key={toast.id} {...toast} />
          ))}
      </div>
      <div {...regionAttributes.assertive}>
        {toasts
          .filter((toast) => engine.getToastType(toast) === "assertive")
          .map((toast) => (
            <ToastComponent key={toast.id} {...toast} />
          ))}
      </div>
    </div>,
    document.body
  );
}
