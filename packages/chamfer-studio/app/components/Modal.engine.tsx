import type { MouseEvent } from "react";

import type { DialogOptions, DialogProperties, DialogState } from "./DialogEngine";
import { DialogEngine } from "./DialogEngine";

export type ModalState = DialogState;
export type ModalOptions = DialogOptions & {
  /**
   * Opens the modal right away when the dialog node mounts
   */
  openOnMount?: boolean;
  destroy: () => boolean;
};
export type ModalProperties = DialogProperties & {
  onMount: (node: HTMLDialogElement | null) => void;
};

export class ModalEngine<S extends DialogState = DialogState>
  extends DialogEngine<S>
  implements ModalProperties
{
  constructor(args?: Partial<ModalOptions>) {
    super(args);
    this._isOpen = args?.openOnMount ?? false;
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  private _onCancel = (e: Event) => {
    e.preventDefault();
    if (!this._options.disableCloseOnEscapePress) this.close();
  };

  private _onClose = (e: Event) => {
    e.preventDefault();
    if (!this._options.disableCloseOnEscapePress) this.close();
  };

  private _onBackdropClick = (e: Event) => {
    const { nodeName } = e.target as HTMLDialogElement;
    if (nodeName === "DIALOG" && this._options.closeOnBackdropClick) {
      this.close();
    }
  };

  onMount(node: HTMLDialogElement | null, options: ModalOptions): void;
  onMount(node: HTMLDialogElement | null): void;
  onMount(node: HTMLDialogElement | null, options?: ModalOptions) {
    if (options) {
      this._isOpen = options?.openOnMount ?? this._isOpen;
      this._options.closeOnBackdropClick =
        options?.closeOnBackdropClick ?? this._options.closeOnBackdropClick;
      this._options.disableCloseOnEscapePress =
        options?.disableCloseOnEscapePress ?? this._options.disableCloseOnEscapePress;
    }
    if (!node) return;
    this._setNode(node);

    // Attach event listeners once
    node.addEventListener("cancel", this._onCancel);
    node.addEventListener("close", this._onClose);
    node.addEventListener("click", this._onBackdropClick);

    return () => {
      // Attach event listeners once
      node.removeEventListener("cancel", this._onCancel);
      node.removeEventListener("close", this._onClose);
      node.removeEventListener("click", this._onBackdropClick);
    };
  }

  /**
   * A programmatic way to do a little extra when opening a modal. This method
   * can be run inside of click handler for a button where some initial state
   * can be loaded
   */
  open<E extends HTMLElement>(_e?: MouseEvent<E>): void {
    const dialog = this._getDialog();

    // show the dialog as a modal dialog
    dialog.showModal();
  }

  async close() {
    const dialog = this._getDialog();

    // add the class close to the dialog to add any closing animations
    dialog.dataset.close = "true";

    // get the animations on the entire dialog and wait until they complete
    const animations = dialog.getAnimations({ subtree: true });
    await Promise.allSettled(animations.map((animation) => animation.finished));

    // close the dialog
    this._closeDialog();

    // Remove the animatable attribute
    dialog.removeAttribute("data-close");
  }
}
