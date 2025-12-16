import { TransactionStore } from "@green-flash/reactor";

export type PopoverEngineState = Record<string, unknown>;

export type PopoverEngineOptions = {
  /**
   * Specifies how the popover's open/closed state is controlled.
   *
   * - "auto": The popover's state is controlled automatically by the browser;
   *           user interactions (such as clicks on the anchor, Escape key, or clicking outside the popover)
   *           will open and close the popover.
   * - "hint": The popover is presented as a transient popup and is dismissed automatically when focus leaves it,
   *           or by user interaction (similar to tooltips or hints).
   * - "manual": The application is responsible for programmatically controlling when the popover is shown or hidden.
   *
   * For details, see: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/popover
   *
   * @default auto
   */
  type?: "auto" | "hint" | "manual";
};

export class PopoverEngine<
  S extends PopoverEngineState | undefined
> extends TransactionStore<S & { isOpen: boolean }> {
  #popoverTarget: HTMLElement | undefined = undefined;
  #popoverNode: HTMLElement | undefined = undefined;
  options: Required<PopoverEngineOptions>;

  constructor(options: PopoverEngineOptions) {
    super({} as S & { isOpen: boolean });
    this.options = {
      type: options?.type ?? "auto",
    };

    this.openPopover = this.openPopover.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
    this.closePopover = this.closePopover.bind(this);
  }

  setPopoverNode(node: HTMLElement) {
    this.#popoverNode = node;
    this.#popoverNode.popover = this.options.type;
  }

  getPopoverTarget() {
    if (!this.#popoverTarget) {
      throw new Error("Cannot determine the popover target");
    }
    return this.#popoverTarget;
  }

  getPopoverNode() {
    if (!this.#popoverNode) {
      throw new Error("Cannot determine the popover node");
    }
    return this.#popoverNode;
  }

  /**
   * Opens the popover in a controlled manner.
   *
   * This method should be called in response to a user event (e.g., click or focus). It sets the popover's target
   * (the element that triggered the event) and updates the state to mark the popover as open. If typed state is
   * provided (when S is not undefined), its properties are merged into the open state.
   */
  openPopover<T extends Event>(e: T): S extends undefined ? void : never;
  openPopover<T extends Event>(
    e: T,
    state: S extends undefined ? never : S
  ): S extends undefined ? never : void;
  openPopover<T extends Event>(
    e: T,
    state?: S extends undefined ? never : S
  ): void {
    if (!e.currentTarget) {
      throw new Error(
        "Cannot determine the target that attempted to launch the popover."
      );
    }
    this.#popoverTarget = e.currentTarget as HTMLElement;

    this.enqueue({
      mutate: (draft) => {
        draft.isOpen = true;
        if (state !== undefined) {
          Object.assign(draft, state);
        }
      },
    });

    // Let the ay adapter decide when to call popover.showPopover()
  }

  togglePopover() {
    const popover = this.getPopoverNode();
    popover.togglePopover();
  }

  async closePopover() {
    const popover = this.getPopoverNode();
    popover.classList.add("close");

    const animations = popover
      .getAnimations()
      .filter((animation) => animation instanceof CSSAnimation)
      .map((animation) => animation.finished);
    await Promise.all(animations);

    popover.hidePopover();
    popover.classList.remove("close");
    this.enqueue({
      mutate: (draft) => {
        draft.isOpen = false;
      },
    });
  }

  /**
   * Shows the popover programmatically with the source anchor element.
   * This should be called after setting the popover node and target.
   */
  showPopover() {
    const popover = this.getPopoverNode();
    const target = this.getPopoverTarget();
    // TypeScript's type definitions for HTMLElement#showPopover may not be up to date.
    // According to MDN, showPopover can accept an options object with { source: HTMLElement }
    // This is super important for accessibility and CSS functionality using :anchor
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/showPopover#source
    // @ts-expect-error: Argument may not be in the current TS lib types, but browsers accept it.
    popover.showPopover({ source: target });
  }
}
