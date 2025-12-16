import { TransactionStore } from "@green-flash/reactor";

import { isEventLike } from "../utils/util.isEventLike.js";

export type ModalState = Record<string, unknown>;
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
   * Adding this pop will disable the functionality of closing the dialog
   * with the escape key
   * @default true
   */
  closeOnEscapePress?: boolean;
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
 * sequence before updating state.
 */
export class ModalEngine<
  S extends ModalState | undefined
> extends TransactionStore<S & { isOpen: boolean }> {
  #dialogNode: HTMLDialogElement | null = null;
  #options: Required<ModalOptions>;

  constructor(options?: ModalOptions) {
    super({} as S & { isOpen: boolean });
    this.#options = {
      ...options,
      closeOnBackdropClick: options?.closeOnBackdropClick ?? false,
      closeOnEscapePress: options?.closeOnEscapePress ?? false,
    };

    this.launch = this.launch.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onMount = this.onMount.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  /**
   * @returns The dialog node. Throws an error if the dialog node is not set.
   */
  #getDialogNode() {
    const dialog = this.#dialogNode;
    if (!dialog) throw "Unable to get dialog. Dialog node not set.";
    return dialog;
  }

  #onCancel = (e: Event) => {
    e.preventDefault();
    if (this.#options.closeOnEscapePress) this.closeModal();
  };

  #onClose = (e: Event) => {
    e.preventDefault();
    if (this.#options.closeOnEscapePress) this.closeModal();
  };

  #onBackdropClick = (e: Event) => {
    const { nodeName } = e.target as HTMLDialogElement;
    if (nodeName === "DIALOG" && this.#options.closeOnBackdropClick) {
      this.closeModal();
    }
  };

  onMount(node: HTMLDialogElement | null) {
    if (!node) return;
    this.#dialogNode = node;
    this.#dialogNode.showModal();

    // Attach event listeners once
    node.addEventListener("cancel", this.#onCancel);
    node.addEventListener("close", this.#onClose);
    node.addEventListener("click", this.#onBackdropClick);
  }

  /**
   * Opens the modal dialog in a controlled manner.
   *
   * This method can be triggered programmatically or in response to a user interaction
   * (such as a button click), and optionally accepts a MouseEvent.
   *
   * Use this for reliably showing/modifying modal state and rendering the native <dialog> element,
   * optionally updating modal state if provided.
   */
  launch<T extends Event>(event: S extends undefined ? T : never): void;
  launch(state: S extends undefined ? never : S): void;
  launch<T extends Event>(eventOrState: S extends undefined ? T : S): void {
    // Set the initial state if need be
    // but set the state to open. In the component, once the state
    // is open, then the modal will mount
    this.enqueue({
      mutate: (draft) => {
        draft.isOpen = true;
        if (isEventLike(eventOrState)) return;
        Object.assign(draft, eventOrState);
      },
    });
  }

  /**
   * Closes the modal dialog with transition support.
   *
   * This method handles animating and closing the native <dialog> element in a controlled way,
   * allowing for custom closing (leave) animations to play smoothly before the dialog is actually closed.
   *
   * This should be called whenever you want the modal to close with animation, such as in response to a user
   * action or programmatically closing the modal.
   */
  async closeModal() {
    const dialog = this.#getDialogNode();

    // add the class close to the dialog to add any closing animations
    dialog.classList.add("close");

    // get the animations on the entire dialog and wait until they complete
    const animations = dialog
      .getAnimations()
      .filter((animation) => animation instanceof CSSAnimation)
      .map((animation) => animation.finished);
    await Promise.all(animations);

    // close the dialog
    dialog.close();

    // Remove the animatable attribute
    dialog.classList.remove("close");
    this.enqueue({
      mutate: (draft) => {
        draft.isOpen = false;
      },
    });
    dialog.removeEventListener("cancel", this.#onCancel);
    dialog.removeEventListener("close", this.#onClose);
    dialog.removeEventListener("click", this.#onBackdropClick);
  }
}
