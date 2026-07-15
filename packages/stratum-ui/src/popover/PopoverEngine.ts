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
  static #nextAnchorId = 0;

  #popoverTarget: HTMLElement | undefined = undefined;
  #popoverNode: HTMLElement | undefined = undefined;
  #type: PopoverEngineType;
  #closingSettled: Promise<void> | undefined;
  /**
   * Overrides which element gets focus back on close, decoupled from
   * `#popoverTarget` (the anchor-positioning reference) — the two are usually
   * the same element (a normal trigger button both anchors the popover and
   * should get focus back), but not always: a context menu anchors to an
   * invisible point at the cursor, which isn't focusable and shouldn't be
   * treated as "where focus goes back to." Cleared after every close, so it
   * only ever applies to the open it was set for.
   */
  #focusReturnTarget: HTMLElement | undefined = undefined;
  /**
   * A unique `anchor-name` for this engine's whole lifetime, explicitly tethered
   * to the popover via `position-anchor` and to the target via `anchor-name`.
   * `showPopover({ source })` alone establishes only an *implicit* anchor
   * reference — every anchor-positioning example in MDN's docs, including the
   * fallback/flip mechanism specifically, is demonstrated with this explicit
   * pairing instead, and nothing documents the implicit one as equivalent for
   * `position-try-fallbacks` purposes. `source` is still passed for its other,
   * documented benefit (keyboard focus order), so both are set.
   */
  #anchorName = `--stratum-popover-anchor-${PopoverEngine.#nextAnchorId++}`;

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
    this.#focusReturnTarget = undefined;
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
    const target = this.#focusReturnTarget ?? this.#popoverTarget;
    if (!node || !target) return;
    const active = document.activeElement;
    if (active && (active === node || node.contains(active))) {
      target.focus();
    }
  }

  /**
   * Overrides which element receives focus back when the popover closes,
   * decoupled from the anchor-positioning target — call just before
   * `openPopover()`/`togglePopover()`. Only applies to the very next close;
   * cleared automatically afterward, so omitting this call (the common case)
   * just falls back to whatever element was used for positioning.
   */
  setFocusReturnTarget(node: HTMLElement | undefined) {
    this.#focusReturnTarget = node;
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
   * Which grid side (per `position-area`'s 3x3 model) a position primarily
   * belongs to — used to know which single inset property to nudge for the
   * configured offset, and to compute the anchor-relative fallback math.
   */
  #primarySide(position: PopoverEnginePosition): "top" | "bottom" | "left" | "right" {
    if (position.startsWith("top")) return "top";
    if (position.startsWith("bottom")) return "bottom";
    if (position.startsWith("left")) return "left";
    return "right";
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
   * Fallback positioning for browsers without `position-area` support — computes
   * the equivalent placement manually via the `anchor()` function. Kept
   * deliberately consistent with what `position-area` itself means (verified
   * against the spec): a two-keyword corner (`"bottom-left"`) is a *diagonal*
   * placement with no overlap of the anchor, while a `span-*` variant
   * (`"bottom-span-left"`) is edge-aligned *with* overlap — the usual "dropdown
   * hangs below, left-aligned" shape. `top`/`bottom`/`left`/`right` alone center
   * on the anchor via `anchor(center)` + a transform, not by setting both
   * opposing insets (which would force the box's size to match the anchor's).
   */
  #getPopoverPositioning(
    position: PopoverEnginePosition,
    offset: number
  ): Partial<CSSStyleDeclaration> {
    const styles: Partial<CSSStyleDeclaration> = {
      // `fixed`, not `absolute` — the popover is promoted to the top layer, and
      // `absolute`'s containing block is the nearest *positioned ancestor*, not
      // the viewport, which breaks `position-try-fallbacks`'s viewport-overflow
      // detection. `fixed`'s containing block is the viewport, which is what
      // every anchor-positioning example (and the popover's own UA stylesheet
      // default) actually uses.
      position: "fixed",
      margin: "0"
    };

    switch (position) {
      // Centered, full-span
      case "bottom": {
        styles.top = this.#anchorWithOffset("bottom", offset);
        styles.left = "anchor(center)";
        styles.transform = "translateX(-50%)";
        break;
      }
      case "top": {
        styles.bottom = this.#anchorWithOffset("top", -offset);
        styles.left = "anchor(center)";
        styles.transform = "translateX(-50%)";
        break;
      }
      case "left": {
        styles.right = this.#anchorWithOffset("left", -offset);
        styles.top = "anchor(center)";
        styles.transform = "translateY(-50%)";
        break;
      }
      case "right": {
        styles.left = this.#anchorWithOffset("right", offset);
        styles.top = "anchor(center)";
        styles.transform = "translateY(-50%)";
        break;
      }

      // Diagonal corners — no overlap with the anchor
      case "bottom-left": {
        styles.top = this.#anchorWithOffset("bottom", offset);
        styles.right = "anchor(left)";
        break;
      }
      case "bottom-right": {
        styles.top = this.#anchorWithOffset("bottom", offset);
        styles.left = "anchor(right)";
        break;
      }
      case "top-left": {
        styles.bottom = this.#anchorWithOffset("top", -offset);
        styles.right = "anchor(left)";
        break;
      }
      case "top-right": {
        styles.bottom = this.#anchorWithOffset("top", -offset);
        styles.left = "anchor(right)";
        break;
      }

      // Edge-aligned, overlapping the anchor's near half
      case "bottom-span-left": {
        styles.top = this.#anchorWithOffset("bottom", offset);
        styles.left = "anchor(left)";
        break;
      }
      case "bottom-span-right": {
        styles.top = this.#anchorWithOffset("bottom", offset);
        styles.right = "anchor(right)";
        break;
      }
      case "top-span-left": {
        styles.bottom = this.#anchorWithOffset("top", -offset);
        styles.left = "anchor(left)";
        break;
      }
      case "top-span-right": {
        styles.bottom = this.#anchorWithOffset("top", -offset);
        styles.right = "anchor(right)";
        break;
      }
      case "left-span-top": {
        styles.right = this.#anchorWithOffset("left", -offset);
        styles.top = "anchor(top)";
        break;
      }
      case "left-span-bottom": {
        styles.right = this.#anchorWithOffset("left", -offset);
        styles.bottom = "anchor(bottom)";
        break;
      }
      case "right-span-top": {
        styles.left = this.#anchorWithOffset("right", offset);
        styles.top = "anchor(top)";
        break;
      }
      case "right-span-bottom": {
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
   * Sets popover styles, preferring `position-area` (which handles all
   * anchor-relative alignment/spanning itself) over the manual `anchor()`
   * fallback. The two are never combined: per spec, once `position-area` is
   * set, inset properties are reinterpreted as offsets *from the
   * position-area box*, not from the anchor, so an `anchor()`-resolved pixel
   * value lands somewhere close to arbitrary rather than nudging anything.
   * The one inset property set in the `position-area` branch is a plain pixel
   * offset — exactly what "offset from the position-area" expects — nudging
   * the edge nearest the anchor further away by `offset`.
   *
   * Always resets all four insets and the transform first: `setPosition()`
   * can switch which single inset property is meaningful (e.g. `top` for
   * `"bottom"` vs `right` for `"left"`), and a stale value from a previous
   * position would otherwise linger.
   *
   * Accepts optional overrides so `setPosition()`/`setOffset()` can restyle an
   * already-mounted popover immediately — `enqueue()` applies its mutation on
   * the next microtask, so `getState()` wouldn't yet reflect a value changed
   * in the same synchronous call.
   */
  setPopoverStyles(overrides?: { position?: PopoverEnginePosition; offset?: number }) {
    const position = overrides?.position ?? this.getState().position;
    if (!position) return;

    const popover = this.getPopoverNode();
    const offset = overrides?.offset ?? this.getState().offset;

    popover.style.positionAnchor = this.#anchorName;
    popover.style.top = "auto";
    popover.style.right = "auto";
    popover.style.bottom = "auto";
    popover.style.left = "auto";
    popover.style.transform = "none";

    if (CSS.supports("position-area")) {
      const side = this.#primarySide(position);
      // `margin`, not an inset property, for the offset gap: exactly how a given
      // inset property behaves once `position-area` is set turned out to be
      // inconsistent across the near vs. far edge of the area (offset silently
      // had no effect for every `top`-side position specifically) — margin
      // sidesteps that entirely, since it adds real visual space around the box
      // the same way it always does, independent of how `position-area`
      // reinterprets `top`/`right`/`bottom`/`left`.
      const marginProp =
        side === "top"
          ? "marginBottom"
          : side === "bottom"
            ? "marginTop"
            : side === "left"
              ? "marginRight"
              : "marginLeft";
      Object.assign(popover.style, {
        // See the comment in `#getPopoverPositioning` — `fixed`, not `absolute`,
        // so the viewport (not the nearest positioned ancestor) is the
        // containing block `position-try-fallbacks` checks for overflow.
        position: "fixed",
        margin: "0",
        positionArea: this.#getPositionArea(position),
        positionTryFallbacks: "flip-block, flip-inline",
        [marginProp]: `${offset}px`
      });
      return;
    }

    Object.assign(popover.style, this.#getPopoverPositioning(position, offset));
  }

  /**
   * Updates the popover's position, restyling immediately if it's currently
   * mounted (open or not) — the new value also takes effect for the next
   * `openPopover()`/`togglePopover()` call regardless.
   */
  setPosition(position: PopoverEnginePosition) {
    this.enqueue({
      mutate: (draft) => {
        draft.position = position;
      }
    });
    if (this.#popoverNode) {
      this.setPopoverStyles({ position });
    }
  }

  /** Updates the popover's offset — same immediate-restyle behavior as `setPosition()`. */
  setOffset(offset: number) {
    this.enqueue({
      mutate: (draft) => {
        draft.offset = offset;
      }
    });
    if (this.#popoverNode) {
      this.setPopoverStyles({ offset });
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
    target.style.anchorName = this.#anchorName;
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
   *
   * Safe to call regardless of current state: `hidePopover()` throws if the
   * popover is already hidden/hiding, so this only calls it while `isOpen` is
   * still true — if a close is already underway (e.g. native light-dismiss
   * already fired), it just awaits that same in-flight close instead of
   * trying to hide an already-hidden popover a second time.
   */
  async closePopover() {
    if (this.getState().isOpen) {
      this.getPopoverNode().hidePopover();
    }
    await this.#closingSettled;
  }

  destroy() {
    this.#detachListeners();
    this.#popoverTarget?.style.removeProperty("anchor-name");
    this.#popoverNode = undefined;
    this.#popoverTarget = undefined;
    super.destroy();
  }
}
