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
  offset: number;
  position: PopoverEnginePosition;
};
type EngineState<S extends PopoverEngineState | undefined> = S extends undefined
  ? EngineBaseState
  : S & EngineBaseState;

export type PopoverEngineOptions = Partial<Omit<EngineBaseState, "isOpen">> & {
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

export class PopoverEngine<
  S extends PopoverEngineState | undefined
> extends TransactionStore<EngineState<S>> {
  #popoverTarget: HTMLElement | undefined = undefined;
  #popoverNode: HTMLElement | undefined = undefined;
  #type: PopoverEngineType;

  constructor({ type = "auto", ...options }: PopoverEngineOptions) {
    super({
      isOpen: false,
      offset: options.offset ?? 0,
      ...options,
    } as EngineState<S>);

    this.#type = type;

    this.openPopover = this.openPopover.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
    this.closePopover = this.closePopover.bind(this);
  }

  setPopoverNode(node: HTMLElement) {
    this.#popoverNode = node;
    this.#popoverNode.popover = this.#type;
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
   * Helper to create anchor() function call with offset.
   * The anchor() function accepts an optional second parameter for offset.
   */
  #anchorWithOffset(side: string, offset: number): string {
    if (offset === 0) {
      return `anchor(${side})`;
    }
    return `anchor(${side}, ${offset}px)`;
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
      // @ts-expect-error This is still an experimental feature
      positionTryFallbacks: "flip-block, flip-inline",
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
      // @ts-expect-error: position-area is an experimental CSS property
      popover.style.positionArea = positionArea;
    }
    // Note: Offset is now included directly in the anchor() function calls above
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
      .getAnimations({ subtree: true })
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
    this.setPopoverStyles();
    // TypeScript's type definitions for HTMLElement#showPopover may not be up to date.
    // According to MDN, showPopover can accept an options object with { source: HTMLElement }
    // This is super important for accessibility and CSS functionality using :anchor
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/showPopover#source
    // @ts-expect-error: Argument may not be in the current TS lib types, but browsers accept it.
    popover.showPopover({ source: target });
  }
}
