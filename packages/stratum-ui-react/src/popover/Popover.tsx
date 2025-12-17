/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  PopoverEngineOptions,
  PopoverEngineState,
} from "@stratum-ui/core";
import { PopoverEngine } from "@stratum-ui/core";
import { lazy, type ComponentType, type ReactNode } from "react";

import { PopoverProvider } from "./Popover.provider.js";
import { usePopoverContext } from "./popover.usePopoverContext.js";

export type LoadComponentFunction = () => Promise<{
  default: ComponentType<any>;
}>;

export type PopoverComponent = (props: PopoverComponentProps) => ReactNode;
export type PopoverComponentProps = {
  ref: (node: HTMLElement | null) => void;
  children: ReactNode;
  className?: string;
};

export type PopoverOptions = PopoverEngineOptions & {
  /**
   * Optional custom Popover component to render the popover container.
   * By default, a standard container is rendered. Provide this to override
   * the popover's outermost element (for example, to add animation, custom
   * layouts, or accessibility features). Receives ref, children, and
   * className as props.
   */
  PopoverComponent?: PopoverComponent;
  /**
   * `className` for the outer Popover container element.
   */
  className?: string;
  // We use `any` here for the loaded component type because consumers may provide any
  // React component with arbitrary props; constraining the type would reduce flexibility
  // and create issues with valid components that require specific props. This pattern is
  // common for dynamic imports/loading in frameworks and libraries.
  load: LoadComponentFunction;
};

export abstract class Popover<S extends PopoverEngineState | undefined> {
  #engine: PopoverEngine<S>;
  #LazyPopoverContent: () => ReactNode;
  #className: string | undefined;

  closePopover: () => Promise<void>;
  togglePopover: () => void;
  openPopover: {
    <T extends Event>(e: T): S extends undefined ? void : never;
    <T extends Event>(
      e: T,
      state: S extends undefined ? never : S
    ): S extends undefined ? never : void;
  };
  preloadContent: LoadComponentFunction;
  /**
   * Preloads the popover content before rendering as a hint or in response to an anticipated interaction.
   * Call this on events like onFocus, onMouseEnter, or onPointerEnter to load content early
   * (useful for tooltips, hints, or previews with latency).
   */
  preloadHandlers: {
    onMouseEnter: LoadComponentFunction;
    onMouseOver: LoadComponentFunction;
    onFocus: LoadComponentFunction;
  };
  #PopoverComponent: PopoverComponent | undefined;

  constructor({
    load,
    className,
    PopoverComponent,
    ...options
  }: PopoverOptions) {
    this.#engine = new PopoverEngine<S>(options);
    this.#className = className;
    this.#PopoverComponent = PopoverComponent;

    this.openPopover = this.#engine.openPopover;
    this.closePopover = this.#engine.closePopover;
    this.togglePopover = this.#engine.togglePopover;

    this.Render = this.Render.bind(this);
    this.onMount = this.onMount.bind(this);

    const LazyComp = lazy(load);
    this.#LazyPopoverContent = () => <LazyComp />;
    /**
     * Imperatively preloads the popover content before it's used.
     * This method returns a promise for the dynamically loaded module.
     * Useful for anticipating popover display (e.g., on hover/focus).
     */
    // Preload the dynamically imported component AND prime the lazy cache
    this.preloadContent = () => {
      // Accessing LazyComp outside of render will start loading it if not already
      void LazyComp._result; // This triggers preload in React 18+
      return load();
    };
    this.preloadHandlers = {
      onMouseEnter: this.preloadContent,
      onMouseOver: this.preloadContent,
      onFocus: this.preloadContent,
    };
  }

  onMount(node: HTMLElement | null) {
    if (!node) return;
    this.#engine.setPopoverNode(node);

    node.addEventListener("beforetoggle", async (e) => {
      if (e.newState === "closed") {
        this.#engine.enqueue({
          mutate: (draft) => {
            draft.isOpen = false;
          },
        });
      }
    });

    // Only show the popover if the state indicates it should be open
    const state = this.#engine.getState();
    if (state.isOpen) this.#engine.showPopover();
  }

  destroy() {}

  Render() {
    const PopoverContent = this.#LazyPopoverContent;
    const PopoverComponent = this.#PopoverComponent;

    return (
      <PopoverProvider engine={this.#engine} instance={this}>
        <PopoverRoot
          onMount={this.onMount}
          className={this.#className}
          PopoverComponent={PopoverComponent}
        >
          <PopoverContent />
        </PopoverRoot>
      </PopoverProvider>
    );
  }
}

function PopoverRoot<S extends PopoverEngineState>({
  children,
  onMount,
  className,
  PopoverComponent,
}: {
  children: ReactNode;
  onMount: Popover<S>["onMount"];
  className?: string;
  PopoverComponent?: PopoverComponent;
}) {
  const { state } = usePopoverContext();

  if (!state.isOpen) return null;

  if (PopoverComponent) {
    return (
      <PopoverComponent ref={onMount} className={className}>
        {children}
      </PopoverComponent>
    );
  }

  return (
    <div ref={onMount} className={className}>
      {children}
    </div>
  );
}
