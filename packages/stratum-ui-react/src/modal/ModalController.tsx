import { type ComponentType, lazy, type ReactNode, Suspense } from "react";
import type { ModalOptions, ModalState } from "@stratum-ui/core";
import { ModalEngine } from "@stratum-ui/core";

import { ModalControllerProvider } from "./ModalController.provider.js";
import { useModalContext } from "./modal.useModalContext.js";

export class ModalController<
  S extends ModalState | undefined
> extends ModalEngine<S> {
  #LazyModalContent: () => ReactNode;

  constructor({
    closeOnBackdropClick = false,
    closeOnEscapePress = true,
    load,
  }: ModalOptions & {
    /**
     * Lazily loaded modal content via dynamic import.
     * If provided, this takes precedence over CustomModalContent.
     *
     * Example:
     *   load: () => import("./UserDetailsModalContent")
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    load: () => Promise<{ default: ComponentType<any> }>;
  }) {
    super({
      closeOnBackdropClick,
      closeOnEscapePress,
    });

    const LazyComp = lazy(load);
    this.#LazyModalContent = () => (
      <Suspense fallback={null}>
        <LazyComp />
      </Suspense>
    );

    this.launch = this.launch.bind(this);
    this.Component = this.Component.bind(this);
  }

  Component() {
    const CustomModalContent = this.#LazyModalContent;

    return (
      <ModalControllerProvider engine={this}>
        <ModalControllerRoot>
          {/* User defined component - follows all react conventions */}
          <CustomModalContent />
        </ModalControllerRoot>
      </ModalControllerProvider>
    );
  }
}

function ModalControllerRoot({ children }: { children: ReactNode }) {
  const { state } = useModalContext();

  if (!state.isOpen) return null;

  return children;
}
