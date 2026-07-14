import { TransactionStore } from "@green-flash/reactor";
import { Logarhythm } from "logarhythm";

import { isEventLike } from "../utils/util.isEventLike.js";

export type ModalState = Record<string, unknown>;
export type ModalEngineOptions = ModalOptions & {
  /**
   * Human-readable label for this modal in debug logs. Defaults to the generated
   * {@link ModalEngine.id} when omitted.
   */
  name?: string;
};
export type ModalOptions = {
  /**
   * Option to determine if the dialog should be closed
   * by clicking on the ::backdrop element
   * @default false
   */
  closeOnBackdropClick?: boolean;
  /**
   * The default functionality of a dialog is to close on the
   * press of the escape key. There are instances where we don't want to close
   * the dialog either due to other escape key listeners for popovers or for
   * other reasons such as destructive actions during wizards in dialogs.
   * Adding this flag will disable the functionality of closing the dialog
   * with the escape key
   * @default false
   */
  disableCloseOnEscapePress?: boolean;
};

/**
 * Core state and lifecycle engine backing every modal controller.
 *
 * Manages modal state via `TransactionStore`, coordinates opening/closing of the
 * native `<dialog>` element, and wires user interactions (escape key, backdrop
 * click) into a controlled close flow with animation support. `ModalController`
 * extends this to add React rendering and lazy loading, while `ModalRegistry`
 * sits above to coordinate multiple controllers. Use `launch()` to open (and
 * optionally seed typed state) and `closeModal()` to run the controlled close
 * sequence while ensuring modal state is closed even if the dialog unmounts
 * before the native close sequence runs.
 *
 * The `LaunchOptions` type parameter lets a subclass (e.g. a React `ModalController`)
 * widen what `launch()`'s options bag accepts — beyond `onClose` and the base
 * `ModalOptions` — without this class needing to know what those extra fields are.
 * Whatever is passed is echoed back via {@link launchOptions} for that subclass to
 * read out again; this class only ever reads `closeOnBackdropClick`/
 * `disableCloseOnEscapePress` off of it.
 */
export class ModalEngine<
  S extends ModalState | undefined,
  LaunchOptions extends ModalOptions = ModalOptions
> extends TransactionStore<S & { isOpen: boolean }> {
  static #nextId = 0;
  readonly id: string;
  readonly name: string;

  #dialogNode: HTMLDialogElement | null = null;
  #log: Logarhythm;
  #baseOptions: Required<ModalOptions>;
  #options: Required<ModalOptions>;
  #onClose: (() => void) | undefined;
  #launchOptions: LaunchOptions | undefined;

  constructor(options?: ModalEngineOptions) {
    super({} as S & { isOpen: boolean });
    this.id = `modal-engine-${ModalEngine.#nextId++}`;
    this.name = options?.name ?? this.id;
    this.#log = new Logarhythm({ name: "ModalEngine", pillColor: "#3b82f6" });
    this.#baseOptions = {
      closeOnBackdropClick: options?.closeOnBackdropClick ?? false,
      disableCloseOnEscapePress: options?.disableCloseOnEscapePress ?? false
    };
    this.#options = this.#baseOptions;

    this.launch = this.launch.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.dismissModal = this.dismissModal.bind(this);
    this.onMount = this.onMount.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  /**
   * Whatever extra options (beyond `onClose`) were passed to the most recent
   * `launch()` call. A subclass that widens `LaunchOptions` (e.g. a React
   * `ModalController` adding `size`/`variant`/`className`) reads this back to
   * resolve per-launch overrides — this class never inspects most of it itself.
   */
  get launchOptions(): LaunchOptions | undefined {
    return this.#launchOptions;
  }

  #onCancel = (e: Event) => {
    e.preventDefault();
    if (!this.#options.disableCloseOnEscapePress) {
      void this.closeModal();
    }
  };

  #onBackdropClick = (e: Event) => {
    const { nodeName } = e.target as HTMLDialogElement;
    if (nodeName === "DIALOG" && this.#options.closeOnBackdropClick) {
      void this.closeModal();
    }
  };

  #detachListeners() {
    this.#dialogNode?.removeEventListener("cancel", this.#onCancel);
    this.#dialogNode?.removeEventListener("click", this.#onBackdropClick);
  }

  /**
   * Closes the state snapshot used by React to render the dialog.
   * This is intentionally separate from the native dialog close so lifecycle
   * races cannot leave `isOpen` stuck true after the node disappears.
   */
  async #setClosedState() {
    await this.enqueue({
      mutate: (draft) => {
        draft.isOpen = false;
      }
    });
  }

  #fireAndClearOnClose() {
    const cb = this.#onClose;
    this.#onClose = undefined;
    cb?.();
  }

  /**
   * Registers the mounted dialog node and attaches dialog-specific event
   * listeners. The consuming adapter (e.g. React) calls this with `null` on
   * unmount, so teardown is handled here even when the modal disappears
   * without the normal close flow (e.g. a route change while it's open).
   */
  onMount(node: HTMLDialogElement | null) {
    if (!node) {
      this.#detachListeners();
      this.#dialogNode = null;
      return;
    }
    this.#dialogNode = node;
    this.#dialogNode.showModal();
    node.addEventListener("cancel", this.#onCancel);
    node.addEventListener("click", this.#onBackdropClick);
  }

  /**
   * Opens the modal dialog in a controlled manner.
   *
   * This method can be triggered programmatically or in response to a user interaction
   * (such as a button click), and optionally accepts an Event.
   *
   * The options bag (only available when the controller has a state type) accepts:
   *  - `onClose` - a callback run when {@link closeModal} (but not {@link dismissModal}) closes the modal
   *  - `closeOnBackdropClick` / `disableCloseOnEscapePress` - override this launch's behavior,
   *    falling back to the value passed at construction when omitted
   *  - anything else a subclass's `LaunchOptions` adds — read back via {@link launchOptions}
   */
  launch<T extends Event>(event?: S extends undefined ? T : never): void;
  launch(
    state: S extends undefined ? never : S,
    options?: { onClose?: () => void } & LaunchOptions
  ): void;
  launch<T extends Event>(
    eventOrState?: S extends undefined ? T : S,
    options?: { onClose?: () => void } & LaunchOptions
  ): void {
    const { onClose, ...launchOptions } = options ?? ({} as { onClose?: () => void } & LaunchOptions);
    this.#onClose = onClose;
    this.#launchOptions = launchOptions as LaunchOptions;
    this.#options = {
      closeOnBackdropClick: launchOptions.closeOnBackdropClick ?? this.#baseOptions.closeOnBackdropClick,
      disableCloseOnEscapePress:
        launchOptions.disableCloseOnEscapePress ?? this.#baseOptions.disableCloseOnEscapePress
    };

    if (eventOrState !== undefined && isEventLike(eventOrState)) {
      this.#log.debug("Launching modal from event", { name: this.name, id: this.id });
    } else if (eventOrState === undefined) {
      this.#log.debug("Launching modal without state", { name: this.name, id: this.id });
    } else {
      this.#log.debug("Launching modal with state", {
        name: this.name,
        id: this.id,
        state: eventOrState
      });
    }

    // Set the initial state if need be
    // but set the state to open. In the component, once the state
    // is open, then the modal will mount
    this.enqueue({
      mutate: (draft) => {
        draft.isOpen = true;
        if (eventOrState === undefined) return;
        if (isEventLike(eventOrState)) return;
        Object.assign(draft, eventOrState);
      }
    });
  }

  /**
   * Closes the modal without firing the `onClose` callback registered at `launch()`.
   *
   * Use this when the user navigates away via a link inside the modal. The modal state
   * is cleaned up with animation, but the caller's `onClose` side-effect (e.g. a router
   * push back to the parent page) is suppressed so it does not fight the link navigation.
   *
   * Do NOT use this for explicit close actions (X button, Escape, Cancel) — use
   * `closeModal()` instead so the caller's `onClose` intent is honoured.
   */
  async dismissModal() {
    this.#onClose = undefined;
    await this.closeModal();
  }

  /**
   * Closes the modal dialog with transition support, then runs the `onClose`
   * callback registered at `launch()` (if any).
   *
   * This method handles animating and closing the native <dialog> element in a controlled way,
   * allowing for custom closing (leave) animations to play smoothly before the dialog is actually closed.
   *
   * Use this for explicit close actions initiated by the user — clicking the X button,
   * pressing Escape, or tapping a Cancel/Done button. Do NOT use this when the user is
   * navigating away via a link inside the modal — use `dismissModal()` instead.
   */
  async closeModal() {
    const dialog = this.#dialogNode;
    if (!dialog) {
      this.#log.error("Dialog node has not been set. Closing modal state anyway.");
      await this.#setClosedState();
      this.#fireAndClearOnClose();
      return;
    }

    try {
      // add the class close to the dialog to add any closing animations
      dialog.classList.add("close");

      // get the animations on the entire dialog and wait until they complete, without
      // letting an interrupted/canceled animation reject and block cleanup
      const animations = dialog
        .getAnimations()
        .filter((animation) => animation instanceof CSSAnimation)
        .map((animation) => animation.finished);
      await Promise.allSettled(animations);

      // the node may already be closed by the browser or another lifecycle path
      if (dialog.open) {
        dialog.close();
      }
    } finally {
      // Remove the animatable attribute and ensure state cannot get stuck open.
      dialog.classList.remove("close");
      await this.#setClosedState();
      this.#fireAndClearOnClose();
    }
  }
}
