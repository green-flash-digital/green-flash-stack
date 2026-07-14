import { TransactionStore } from "@green-flash/reactor";
import { exhaustiveMatchGuard } from "@green-flash/ts-utils/isomorphic";

export type PopoverEngineState = Record<string, unknown>;
export type PopoverEnginePosition =
  | "top"
  | "top-left"
  | "top-right"
  | "top-span-right"
  | "top-span-left"
  | "right"
  | "right-span-top"
  | "right-span-bottom"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "bottom-span-right"
  | "bottom-span-left"
  | "left"
  | "left-span-top"
  | "left-span-bottom";

export type PopoverEngineType = "auto" | "hint" | "manual";

type EngineBaseState = {
  isOpen: boolean;
  /**
   * True from the instant a close begins (explicit call, Escape, click-outside —
   * every dismiss path) until its CSS exit transition actually finishes. The
   * popover container itself is expected to stay persistently mounted for its
   * whole lifetime (that's what lets a CSS `transition` + `allow-discrete` +
   * `@starting-style` animate the close for *every* dismiss path, not just
   * programmatic ones — `beforetoggle` isn't cancelable when closing, so there's
   * no way to intercept a native dismiss the way `ModalEngine` intercepts a
   * dialog's `cancel` event).
   *
   * Content that should stop rendering once closed — but not before its exit
   * animation plays — should key off `isOpen || isClosing`, not `isOpen` alone.
   * Content that should unmount/reset immediately on close can key off `isOpen`
   * directly; that's a legitimate choice too, just a different one.
   */
  isClosing: boolean;
  offset: number;
  position: PopoverEnginePosition;
};
type EngineState<S extends PopoverEngineState | undefined> = S extends undefined
  ? EngineBaseState
  : S & EngineBaseState;

export type PopoverEngineOptions = Partial<Omit<EngineBaseState, "isOpen" | "isClosing">> & {
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
  type?: PopoverEngineType;
};

/**
 * Core state and lifecycle engine backing every popover/menu/dropdown.
 *
 * Wraps the native Popover API (`popover` attribute, `showPopover`/`hidePopover`)
 * and CSS Anchor Positioning (`anchor()`, `position-area`) rather than reimplementing
 * positioning or light-dismiss in JS — the browser's own top-layer rendering is what
 * lets a popover escape a clipping/`overflow: hidden` ancestor for free, and its native
 * "auto" light-dismiss (outside click, Escape) is more battle-tested than a hand-rolled
 * document click-listener. All open/close bookkeeping is driven by the element's own
 * `toggle` event, which fires for every dismiss path uniformly (explicit `closePopover()`
 * call, native light-dismiss, or `.hidePopover()` called directly) — there's no separate
 * code path per trigger source to keep in sync.
 */
export class PopoverEngine<S extends PopoverEngineState | undefined> extends TransactionStore<
  EngineState<S>
> {
  #popoverTarget: HTMLElement | undefined = undefined;
  #popoverNode: HTMLElement | undefined = undefined;
  #type: PopoverEngineType;
  #closingSettled: Promise<void> | undefined;

  constructor({ type = "auto", ...options }: PopoverEngineOptions) {
    super({
      isOpen: false,
      isClosing: false,
      offset: options.offset ?? 0,
      // `setPopoverStyles()` no-ops entirely when `position` is unset, silently
      // leaving the popover with no positioning at all (falls back to wherever
      // the UA default top-layer placement happens to be) — a default here means
      // that's a deliberate override, not a trap for anyone who didn't think to
      // pass one.
      position: options.position ?? "bottom",
      ...options
    } as EngineState<S>);

    this.#type = type;

    this.openPopover = this.openPopover.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
    this.closePopover = this.closePopover.bind(this);
    this.onMount = this.onMount.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  #onToggle = (e: Event) => {
    const { newState } = e as ToggleEvent;

    if (newState === "open") {
      this.enqueue({
        mutate: (draft) => {
          draft.isOpen = true;
          draft.isClosing = false;
        }
      });
      return;
    }

    this.enqueue({
      mutate: (draft) => {
        draft.isOpen = false;
        draft.isClosing = true;
      }
    });
    this.#restoreFocus();
    this.#closingSettled = this.#waitForExitTransition();
  };

  /**
   * Waits for the popover's own exit transition to finish (mirrors how
   * `ModalEngine.closeModal()` waits on `getAnimations()`), then clears
   * `isClosing`. Runs regardless of what triggered the close.
   */
  async #waitForExitTransition() {
    const node = this.#popoverNode;
    if (!node) return;
    const animations = node.getAnimations().map((animation) => animation.finished.catch(() => undefined));
    await Promise.allSettled(animations);
    this.enqueue({
      mutate: (draft) => {
        draft.isClosing = false;
      }
    });
  }

  /**
   * Returns focus to the element that opened the popover, but only if focus is
   * currently inside the popover — if the user already moved focus elsewhere
   * (tabbed away, clicked another control) before the popover finished closing,
   * yanking focus back to the trigger would be disorienting rather than helpful.
   */
  #restoreFocus() {
    const node = this.#popoverNode;
    const target = this.#popoverTarget;
    if (!node || !target) return;
    const active = document.activeElement;
    if (active && (active === node || node.contains(active))) {
      target.focus();
    }
  }

  #detachListeners() {
    this.#popoverNode?.removeEventListener("toggle", this.#onToggle);
  }

  /**
   * Registers the persistently-mounted popover node and attaches the `toggle`
   * listener that drives all open/close bookkeeping. Unlike `ModalEngine`, the
   * popover container is expected to stay mounted for its whole lifetime — see
   * {@link EngineBaseState.isClosing} for why. The consuming adapter (e.g. React)
   * calls this with `null` on unmount for cleanup.
   */
  onMount(node: HTMLElement | null) {
    if (!node) {
      this.#detachListeners();
      this.#popoverNode = undefined;
      return;
    }
    this.#popoverNode = node;
    node.popover = this.#type;
    node.addEventListener("toggle", this.#onToggle);
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
   * Maps PopoverEnginePosition values to position-area strings for CSS anchor positioning.
   * This enables collision detection and anchor fallbacks automatically.
   */
  #getPositionArea(position: PopoverEnginePosition): string {
    switch (position) {
      case "bottom":
        return "bottom";
      case "bottom-left":
        return "bottom left";
      case "bottom-right":
        return "bottom right";
      case "bottom-span-left":
        return "bottom span-left";
      case "bottom-span-right":
        return "bottom span-right";
      case "top":
        return "top";
      case "top-left":
        return "top left";
      case "top-right":
        return "top right";
      case "top-span-left":
        return "top span-left";
      case "top-span-right":
        return "top span-right";
      case "left":
        return "left";
      case "left-span-bottom":
        return "left span-bottom";
      case "left-span-top":
        return "left span-top";
      case "right":
        return "right";
      case "right-span-bottom":
        return "right span-bottom";
      case "right-span-top":
        return "right span-top";
      default:
        exhaustiveMatchGuard(position);
    }
  }

  /**
   * Builds an `anchor()` inset value, adding a real gap via `calc()` when an offset
   * is given. `anchor()`'s own second argument is NOT an offset — per spec it's a
   * fallback used only when the anchor reference fails to resolve, so a previous
   * version of this method that passed the offset there had no visible effect in
   * normal operation (the anchor almost always resolves fine).
   */
  #anchorWithOffset(side: string, offsetPx: number): string {
    if (offsetPx === 0) {
      return `anchor(${side})`;
    }
    const sign = offsetPx > 0 ? "+" : "-";
    return `calc(anchor(${side}) ${sign} ${Math.abs(offsetPx)}px)`;
  }

  /**
   * Gets CSS styles using anchor() function for positioning.
   * When showPopover({ source: target }) is called, the anchor relationship is automatically established.
   */
  #getPopoverPositioning(
    position: PopoverEnginePosition,
    offset: number
  ): Partial<CSSStyleDeclaration> {
    const styles: Partial<CSSStyleDeclaration> = {
      position: "absolute",
      inset: "auto",
      margin: "0",
      positionTryFallbacks: "flip-block, flip-inline"
    };

    switch (position) {
      case "bottom": {
        // Position below anchor, add offset downward
        styles.top = this.#anchorWithOffset("bottom", offset);
        styles.left = "anchor(left)";
        styles.right = "anchor(right)";
        styles.transform = "translateX(-50%)";
        break;
      }
      case "bottom-left": {
        styles.top = this.#anchorWithOffset("bottom", offset);
        styles.right = "anchor(right)";
        break;
      }
      case "bottom-right": {
        styles.top = this.#anchorWithOffset("bottom", offset);
        styles.left = "anchor(left)";
        break;
      }
      case "bottom-span-left": {
        styles.top = this.#anchorWithOffset("bottom", offset);
        styles.right = "anchor(right)";
        break;
      }
      case "bottom-span-right": {
        styles.top = this.#anchorWithOffset("bottom", offset);
        styles.left = "anchor(left)";
        break;
      }
      case "top": {
        // Position above anchor, subtract offset upward (negative offset)
        styles.bottom = this.#anchorWithOffset("top", -offset);
        styles.left = "anchor(left)";
        styles.right = "anchor(right)";
        styles.transform = "translateX(-50%)";
        break;
      }
      case "top-left": {
        styles.bottom = this.#anchorWithOffset("top", -offset);
        styles.right = "anchor(right)";
        break;
      }
      case "top-right": {
        styles.bottom = this.#anchorWithOffset("top", -offset);
        styles.left = "anchor(left)";
        break;
      }
      case "top-span-left": {
        styles.bottom = this.#anchorWithOffset("top", -offset);
        styles.right = "anchor(right)";
        break;
      }
      case "top-span-right": {
        styles.bottom = this.#anchorWithOffset("top", -offset);
        styles.left = "anchor(left)";
        break;
      }
      case "left": {
        // Position to left of anchor, subtract offset leftward (negative offset)
        styles.right = this.#anchorWithOffset("left", -offset);
        styles.top = "anchor(top)";
        styles.bottom = "anchor(bottom)";
        styles.transform = "translateY(-50%)";
        break;
      }
      case "left-span-bottom": {
        styles.right = this.#anchorWithOffset("left", -offset);
        styles.top = "anchor(top)";
        break;
      }
      case "left-span-top": {
        styles.right = this.#anchorWithOffset("left", -offset);
        styles.bottom = "anchor(bottom)";
        break;
      }
      case "right": {
        // Position to right of anchor, add offset rightward
        styles.left = this.#anchorWithOffset("right", offset);
        styles.top = "anchor(top)";
        styles.bottom = "anchor(bottom)";
        styles.transform = "translateY(-50%)";
        break;
      }
      case "right-span-bottom": {
        styles.left = this.#anchorWithOffset("right", offset);
        styles.top = "anchor(top)";
        break;
      }
      case "right-span-top": {
        styles.left = this.#anchorWithOffset("right", offset);
        styles.bottom = "anchor(bottom)";
        break;
      }
      default:
        exhaustiveMatchGuard(position);
    }

    return styles;
  }

  /**
   * Sets popover styles using CSS anchor positioning with anchor() function.
   * This approach provides automatic collision detection and anchor fallbacks
   * without requiring manual position calculations.
   */
  setPopoverStyles() {
    const position = this.getState().position;
    if (!position) return;

    const popover = this.getPopoverNode();
    const offset = this.getState().offset;

    // Get styles using anchor() function
    const popoverStyles = this.#getPopoverPositioning(position, offset);

    // Apply anchor() function styles
    Object.assign(popover.style, popoverStyles);

    // Use position-area for collision detection and fallbacks
    // This works with showPopover({ source: target }) which establishes the anchor relationship
    if (CSS.supports("position-area")) {
      const positionArea = this.#getPositionArea(position);
      popover.style.positionArea = positionArea;
    }
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
  openPopover<T extends Event>(e: T, state?: S extends undefined ? never : S): void {
    if (!e.currentTarget) {
      throw new Error("Cannot determine the target that attempted to launch the popover.");
    }
    this.#prepareTarget(e.currentTarget as HTMLElement);

    if (state !== undefined) {
      this.enqueue({
        mutate: (draft) => {
          Object.assign(draft, state);
        }
      });
    }

    this.getPopoverNode().showPopover({ source: this.#popoverTarget });
  }

  #prepareTarget(target: HTMLElement) {
    this.#popoverTarget = target;
    this.setPopoverStyles();
  }

  /**
   * Toggles the popover. Unlike `openPopover()`, this is safe to wire up to a
   * trigger's click handler unconditionally regardless of current state —
   * `showPopover()` (which `openPopover()` calls) throws if the popover is
   * already open, so a click-to-toggle trigger (the natural shape for a menu
   * button) needs this instead. Accepts the triggering event so the target can
   * still be tracked for anchor positioning and focus-return-on-close, exactly
   * like `openPopover()`.
   */
  togglePopover<T extends Event>(e?: T) {
    if (e?.currentTarget) {
      this.#prepareTarget(e.currentTarget as HTMLElement);
    }
    const popover = this.getPopoverNode();
    if (this.#popoverTarget) {
      popover.togglePopover({ source: this.#popoverTarget });
      return;
    }
    popover.togglePopover();
  }

  /**
   * Closes the popover. The actual open/closed bookkeeping and exit-transition
   * tracking happens uniformly in the `toggle` listener regardless of what closes
   * it — this just triggers that native close and, if the caller wants to know
   * when the exit animation has actually finished, awaits it.
   */
  async closePopover() {
    this.getPopoverNode().hidePopover();
    await this.#closingSettled;
  }

  destroy() {
    this.#detachListeners();
    this.#popoverNode = undefined;
    this.#popoverTarget = undefined;
    super.destroy();
  }
}
