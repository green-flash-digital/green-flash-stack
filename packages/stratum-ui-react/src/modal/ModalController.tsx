import type { JSX, ComponentType, ReactNode } from "react";
import { lazy, Suspense } from "react";

import { classes, ModalEngine, type ModalOptions, type ModalState } from "@stratum-ui/core";

import { useModalContext } from "./modal.useModalContext.js";
import type { ModalSize, ModalVariants } from "./modal.utils.js";
import { modalStylesRoot, modalStyleVariants } from "./modal.utils.js";
import { ModalProvider } from "./ModalProvider.js";

type ModalPropsNative = Omit<JSX.IntrinsicElements["dialog"], "children" | "ref">;
type ModalPropsCustom = {
  /**
   * The size of the modal.
   * @default "md"
   */
  size?: ModalSize;
  /**
   * The visual variant of the modal. For a variant that changes by breakpoint
   * (e.g. a centered modal on desktop, a bottom drawer on mobile), express that
   * as a `@media` query inside your own `className` rather than switching this
   * at runtime — see the README's "Responsive layouts" section.
   * @default "modal"
   */
  variant?: ModalVariants;
};

export type ModalProps = ModalPropsNative & Required<ModalPropsCustom & ModalOptions>;

export type ModalControllerOptions = ModalPropsNative & ModalPropsCustom & ModalOptions;

/**
 * React-aware wrapper around `ModalEngine` that renders modal content and handles
 * lazy loading for code-splitting. It wires the core imperative API (`launch`,
 * `closeModal`) into a typed React component via the provider/context and applies
 * static modal props (size, variant, etc.).
 *
 * `ModalEngine`'s `LaunchOptions` type parameter is set to `ModalControllerOptions`
 * here, so `launch(state, { onClose, size, variant, className, ... })` can override
 * any of this controller's static `props` for that one call — read back out via
 * `engine.launchOptions` in `ModalProvider`. See the README's "Per-launch overrides"
 * section.
 */
export class ModalController<S extends ModalState | undefined = undefined> extends ModalEngine<
  S,
  ModalControllerOptions
> {
  #props: ModalProps = {
    size: "sm",
    variant: "modal",
    closeOnBackdropClick: false,
    disableCloseOnEscapePress: false
  };
  #LazyModalContent: () => ReactNode;
  #fallback: ReactNode;

  constructor({
    name,
    props = {},
    fallback = null,
    load
  }: {
    name: string;
    props?: ModalControllerOptions;
    /**
     * Rendered while the lazy-loaded content is being fetched — passed straight
     * through to the underlying `<Suspense fallback>`.
     * @default null
     */
    fallback?: ReactNode;
    /**
     * Lazily loaded modal content via dynamic import.
     * @example
     *   load: () => import("./UserDetailsModalContent")
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    load: () => Promise<{ default: ComponentType<any> }>;
  }) {
    const { closeOnBackdropClick, disableCloseOnEscapePress, ...restProps } = props;
    super({
      name,
      closeOnBackdropClick,
      disableCloseOnEscapePress
    });
    this.#props = { ...this.#props, ...restProps };
    this.#fallback = fallback;

    const LazyComp = lazy(load);
    this.#LazyModalContent = () => <LazyComp />;

    this.Component = this.Component.bind(this);
  }

  Component() {
    const LazyModalContent = this.#LazyModalContent;
    const staticProps = this.#props;
    const { closeOnBackdropClick, disableCloseOnEscapePress, size, variant, ...rootProps } =
      staticProps;
    return (
      <ModalProvider engine={this} staticProps={staticProps}>
        <ModalControllerRoot engine={this} {...rootProps}>
          <Suspense fallback={this.#fallback}>
            {/* User defined component - follows all react conventions */}
            <LazyModalContent />
          </Suspense>
        </ModalControllerRoot>
      </ModalProvider>
    );
  }
}

type ModalControllerRootProps<S extends ModalState | undefined> = ModalPropsNative & {
  engine: ModalEngine<S, ModalControllerOptions>;
  children: ReactNode;
};

function ModalControllerRoot<S extends ModalState | undefined>({
  engine,
  className,
  children,
  ...restProps
}: ModalControllerRootProps<S>) {
  const {
    state,
    props: { size, variant } // destructure this here since the provider reconciles the size and variant from the props
  } = useModalContext();

  if (!state.isOpen) return null;

  return (
    <dialog
      data-modal-name={engine.name}
      {...restProps}
      ref={engine.onMount}
      className={classes(
        modalStylesRoot,
        modalStyleVariants[variant],
        `modal-size-${size}`,
        className
      )}
    >
      {children}
    </dialog>
  );
}
