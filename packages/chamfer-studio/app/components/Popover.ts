import { exhaustiveMatchGuard, generateGUID } from "@green-flash/ts-utils/isomorphic";
import { Isoscribe } from "isoscribe";

import type { SetAsyncStateQueueState } from "./AsyncStateQueue";
import { AsyncStateQueue } from "./AsyncStateQueue";

export type PopoverTargetAction = "show" | "hide" | "toggle";
export type PopoverType = "auto" | "manual" | "hint";
export type PopoverPosition =
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
export type PopoverOffset = number;

export type PopoverOptions = {
  popoverTargetAction: PopoverTargetAction;
  /**
   * ### `auto`
   * - Auto state is useful when you only want to show a single popover at once.
   * - The popover can be "light dismissed" — this means that you can hide the popover by clicking outside it.
   * - The popover can also be closed, using browser-specific mechanisms such as pressing the Esc key.
   * - Usually, only one auto popover can be shown at a time — showing a second popover when one is already shown will hide the first one. The exception to this rule is when you have nested auto popovers
   *
   * ### `manual`
   * - The popover cannot be "light dismissed", although declarative show/hide/toggle buttons (as seen earlier) will still work.
   * - Multiple independent popovers can be shown simultaneously.
   *
   * ## Docs
   * https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using#auto_state_and_light_dismiss
   *
   * @default auto
   */
  popoverState: PopoverType;
  /**
   * Positions the popover relative to place on target
   *
   * This API abstracts some of the nuance associated with position the element and attempts to
   * bridge the knowledge gap with human readable semantics without having to do a lot of CSS / JS
   * gymnastics
   *
   * Regardless of the browser support, this API follows the `position-area` semantics set fourth
   * in the following MDN Document: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning/Using#setting_a_position-area
   * Another follow up document: https://css-tricks.com/almanac/properties/p/position-anchor/#aa-method-2-position-area-property
   * @default `bottom`
   */
  popoverPosition: PopoverPosition;
  /**
   * The amount of space between the popover and it's associated target
   * @default 0
   */
  popoverOffset: number;
};

type PopoverState = {
  position: PopoverPosition;
  offset: number;
};

export const popoverPosition: PopoverPosition[] = [
  "bottom",
  "bottom-left",
  "bottom-right",
  "bottom-span-left",
  "bottom-span-right",
  "left",
  "left-span-bottom",
  "left-span-top",
  "right",
  "right-span-bottom",
  "right-span-top",
  "top",
  "top-left",
  "top-right",
  "top-span-left",
  "top-span-right"
];

export class Popover {
  private _popover: HTMLElement | null = null;
  private _popoverTarget: HTMLButtonElement | null = null;
  private _popoverTargetAction: PopoverTargetAction;
  private _popoverType: PopoverType;
  private _log = new Isoscribe({
    name: "PopoverEngine",
    pillColor: "#cf275b",
    logLevel: "debug"
  });
  protected _queue: AsyncStateQueue<PopoverState>;
  setState: SetAsyncStateQueueState<PopoverState>;

  constructor(options?: Partial<PopoverOptions>) {
    const initState: PopoverState = {
      position: options?.popoverPosition ?? "bottom",
      offset: options?.popoverOffset ?? 0
    };
    this._queue = new AsyncStateQueue(initState, this._log);
    this._popoverTargetAction = options?.popoverTargetAction ?? "toggle";
    this._popoverType = "auto";

    this.setPopover = this.setPopover.bind(this);
    this.setPopoverTarget = this.setPopoverTarget.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.setState = this._queue.setState;
  }

  protected get _currentState() {
    return this._queue.getState();
  }

  protected _getPopover() {
    if (!this._popover) {
      throw "Cannot get the popover. Popover has not been set.";
    }
    return this._popover;
  }

  protected _getPopoverTarget() {
    if (!this._popoverTarget) {
      throw "Cannot get the popover target. Popover target has not been set.";
    }
    return this._popoverTarget;
  }

  private _onToggle = (e: Event) => {
    const event = e as ToggleEvent;
    const popover = this._getPopover();
    const popoverTarget = this._getPopoverTarget();

    if (event.newState === "open") {
      this._log.debug("Showing popover");
      popover.ariaExpanded = "true";
    }

    if (event.newState === "closed") {
      this._log.debug("Hiding popover");
      popover.ariaExpanded = "false";
      popoverTarget.style.removeProperty("anchorName");
      popoverTarget.style.removeProperty("fixed");
      popoverTarget.style.removeProperty("positionAnchor");
    }
  };

  protected _isOpen() {
    const popover = this._getPopover();
    return popover.matches(":popover-open");
  }

  private _browserSupportsPositionArea() {
    const popover = this._getPopover();
    const supportsPositionArea = "positionArea" in popover.style;
    return supportsPositionArea;
  }

  private _calculatePosition() {
    if (!this._currentState.position) {
      this._log.debug("No position set. Skipping positional calculations");
    }
    const popover = this._getPopover();
    const popoverTarget = this._getPopoverTarget();
    const supportsCSS = this._browserSupportsPositionArea();
    const rect = popoverTarget.getBoundingClientRect();
    const offset = this._currentState.offset;

    let top = rect.top;
    let left = rect.left;
    let translateX: string | 0 = 0;
    let translateY: string | 0 = 0;
    let positionArea: string = this._currentState.position;

    switch (this._currentState.position) {
      case "bottom":
        positionArea = "bottom";
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2;
        translateX = "-50%";
        translateY = 0;
        break;

      case "bottom-left":
        positionArea = "bottom right";
        top = rect.bottom + offset;
        left = rect.left;
        translateX = "-100%";
        break;

      case "bottom-right":
        positionArea = "bottom left";
        top = rect.bottom + offset;
        left = rect.right;
        break;

      case "bottom-span-left":
        positionArea = "bottom span-left";
        top = rect.bottom + offset;
        left = rect.right;
        translateX = "-100%";
        break;

      case "bottom-span-right":
        positionArea = "bottom span-right";
        top = rect.bottom + offset;
        left = rect.left;
        break;

      case "top":
        positionArea = "top";
        left = rect.left + rect.width / 2;
        top = rect.top - offset;
        translateX = "-50%";
        translateY = "-100%";
        break;

      case "top-left":
        positionArea = "top left";
        top = rect.top - offset;
        translateY = "-100%";
        translateX = "-100%";
        break;

      case "top-right":
        positionArea = "top right";
        top = rect.top - offset;
        left = rect.right;
        translateY = "-100%";
        break;

      case "top-span-left":
        positionArea = "top span-left";
        top = rect.top - offset;
        left = rect.right;
        translateY = "-100%";
        translateX = "-100%";
        break;

      case "top-span-right":
        positionArea = "top span-right";
        top = rect.top - offset;
        translateY = "-100%";
        break;

      case "left":
        positionArea = "left";
        top = rect.top + rect.height / 2;
        left = rect.left - popover.offsetWidth - offset;
        translateX = "-100%";
        translateY = "-50%";
        break;

      case "left-span-bottom":
        positionArea = "left span-bottom";
        left = rect.left - popover.offsetWidth - offset;
        translateX = "-100%";
        break;

      case "left-span-top":
        positionArea = "left span-top";
        top = rect.bottom + offset;
        left = rect.left - popover.offsetWidth - offset;
        translateX = "-100%";
        translateY = "-100%";
        break;

      case "right":
        positionArea = "right";
        top = rect.top + rect.height / 2;
        left = rect.right + offset;
        translateX = 0;
        translateY = "-50%";
        break;

      case "right-span-bottom":
        positionArea = "right span-bottom";
        left = rect.right + offset;
        break;

      case "right-span-top":
        positionArea = "right span-top";
        top = rect.bottom;
        left = rect.right + offset;
        translateY = "-100%";
        break;

      default:
        exhaustiveMatchGuard(this._currentState.position);
    }

    // Handle positioning using CSS
    if (supportsCSS) {
      const anchorName = `--${generateGUID()}`;
      popoverTarget.style.anchorName = anchorName;
      popover.style.position = "fixed";
      popover.style.positionAnchor = anchorName;
      popover.style.positionArea = positionArea;
      popover.style.margin = `${this._currentState.offset}px`;

      return;
    }

    // Fallback to using JS
    popover.style.margin = "0px";
    popover.style.position = "fixed";
    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
    popover.style.transform = `translate(${translateX}, ${translateY})`;
  }

  /**
   * Imperatively sets the position of where the popover
   * shows up relative to it's associated target
   */
  setPosition(position: PopoverPosition) {
    this.setState((draft) => {
      draft.position = position;
    });
  }

  /**
   * Imperatively sets the offset or the space between the popover
   * and it's associated target
   */
  setOffset(offset: number) {
    this.setState((draft) => {
      draft.offset = offset;
    });
  }

  getQueue() {
    return this._queue;
  }

  setPopover(node: HTMLElement | null) {
    if (!node) return;
    this._popover = node;
    this._popover.popover = this._popoverType;
    this._log.debug("Setting popover node", node);

    this._popover.addEventListener("toggle", this._onToggle);

    return () => {
      if (!this._popover) return;
      this._popover.removeEventListener("toggle", this._onToggle);
    };
  }

  setPopoverTarget(node: HTMLButtonElement | null) {
    if (!node) return;
    this._popoverTarget = node;
    this._popoverTarget.popoverTargetAction = this._popoverTargetAction;
    this._log.debug("Setting popover target node", node);
  }

  show() {
    if (this._isOpen()) return;
    const popover = this._getPopover();
    this._calculatePosition();
    popover.showPopover();
  }

  async hide() {
    if (!this._isOpen()) return;
    const popover = this._getPopover();
    popover.hidePopover();
  }

  getState() {
    return this._queue.getState();
  }
}
