import type {
  PopoverEngineOptions,
  PopoverEngineState,
} from "@stratum-ui/core";
import { PopoverEngine } from "@stratum-ui/core";
import { lazy, Suspense, type ComponentType, type ReactNode } from "react";

import { PopoverProvider } from "./Popover.provider.js";
import { usePopoverContext } from "./popover.usePopoverContext.js";

export type PopoverOptions = PopoverEngineOptions & {
  // We use `any` here for the loaded component type because consumers may provide any
  // React component with arbitrary props; constraining the type would reduce flexibility
  // and create issues with valid components that require specific props. This pattern is
  // common for dynamic imports/loading in frameworks and libraries.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  load: () => Promise<{ default: ComponentType<any> }>;
};

export abstract class Popover<S extends PopoverEngineState | undefined> {
  #engine: PopoverEngine<S>;
  #LazyPopoverContent: () => ReactNode;

  closePopover: () => Promise<void>;
  togglePopover: () => void;
  openPopover: {
    <T extends Event>(e: T): S extends undefined ? void : never;
    <T extends Event>(
      e: T,
      state: S extends undefined ? never : S
    ): S extends undefined ? never : void;
  };

  constructor({ load, ...options }: PopoverOptions) {
    this.#engine = new PopoverEngine<S>(options);

    this.openPopover = this.#engine.openPopover;
    this.closePopover = this.#engine.closePopover;
    this.togglePopover = this.#engine.togglePopover;

    this.Render = this.Render.bind(this);
    this.onMount = this.onMount.bind(this);

    const LazyComp = lazy(load);
    this.#LazyPopoverContent = () => (
      <Suspense fallback={null}>
        <LazyComp />
      </Suspense>
    );
  }

  onMount(node: HTMLElement | null) {
    if (!node) return;
    this.#engine.setPopoverNode(node);

    // Only show the popover if the state indicates it should be open
    const state = this.#engine.getState();
    if (state.isOpen) this.#engine.showPopover();
  }

  Render() {
    const PopoverContent = this.#LazyPopoverContent;
    return (
      <PopoverProvider engine={this.#engine} instance={this}>
        <PopoverRoot onMount={this.onMount}>
          <PopoverContent />
        </PopoverRoot>
      </PopoverProvider>
    );
  }
}

function PopoverRoot<S extends PopoverEngineState>({
  children,
  onMount,
}: {
  children: ReactNode;
  onMount: Popover<S>["onMount"];
}) {
  const { state } = usePopoverContext();

  if (!state.isOpen) return null;

  return <div ref={onMount}>{children}</div>;
}
