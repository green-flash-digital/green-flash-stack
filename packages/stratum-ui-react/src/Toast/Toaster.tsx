import type { ToastOptions, ToastProps, ToastState } from "@stratum-ui/core";
import { ToastEngine } from "@stratum-ui/core";
import type { ReactNode } from "react";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

export type ToastContainerProps = { className?: string; children: ReactNode };
export type ToastContainerComponent = (props: ToastContainerProps) => ReactNode;

export type ToasterOptions<T extends ToastProps> = ToastOptions & {
  ToastComponent: (props: ToastState<T>) => ReactNode;
  containerClassName?: string;
  ToastContainer?: ToastContainerComponent;
};

export class Toaster<T extends ToastProps> extends ToastEngine<T> {
  #ToastComponent: (props: ToastState<T>) => ReactNode;
  #className: string | undefined;
  #ToastContainer: ToastContainerComponent | undefined;

  constructor(options: ToasterOptions<T>) {
    super(options);
    this.#className = options.containerClassName;
    this.#ToastComponent = options.ToastComponent;
    this.#ToastContainer = options.ToastContainer;
    this.Render = this.Render.bind(this);
  }

  Render() {
    return (
      <ToastRenderer<T>
        engine={this}
        ToastContainer={this.#ToastContainer}
        ToastComponent={this.#ToastComponent}
        className={this.#className}
      />
    );
  }
}

function ToastRenderer<T extends ToastProps>({
  engine,
  className,
  ToastContainer,
  ToastComponent,
}: {
  engine: Toaster<T>;
  className?: string;
  ToastComponent: (props: ToastState<T>) => ReactNode;
  ToastContainer: ToastContainerComponent | undefined;
}) {
  const toasts = useSyncExternalStore(
    engine.subscribe,
    engine.getState,
    engine.getState
  );
  const regionProps = useMemo(
    () => engine.getRegionAttributes({ toKebabCase: true }),
    [engine]
  );

  useEffect(() => {
    return () => {
      engine.destroy();
    };
  }, [engine]);

  return createPortal(
    <Container ToastContainer={ToastContainer} className={className}>
      <div {...regionProps.polite}>
        {toasts
          .filter((toast) => engine.getToastType(toast) === "polite")
          .map((toast) => (
            <ToastComponent key={toast.id} {...toast} />
          ))}
      </div>
      <div {...regionProps.assertive}>
        {toasts
          .filter((toast) => engine.getToastType(toast) === "assertive")
          .map((toast) => (
            <ToastComponent key={toast.id} {...toast} />
          ))}
      </div>
    </Container>,
    document.body
  );
}

function Container({
  ToastContainer,
  className,
  children,
}: ToastContainerProps & { ToastContainer?: ToastContainerComponent }) {
  if (ToastContainer) {
    return <ToastContainer className={className}>{children}</ToastContainer>;
  }
  return <div className={className}>{children}</div>;
}
