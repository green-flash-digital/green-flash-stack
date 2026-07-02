import {
  type MutableRefObject,
  type Ref,
  type RefCallback,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

export type ModalDefaultState = Record<string, unknown>;

export type ModalRef<T extends ModalDefaultState = ModalDefaultState> = {
  handleOpen: (
    e: React.MouseEvent<HTMLElement> | undefined,
    initialData?: T
  ) => void;
  handleClose: () => void;
  nodeRef: MutableRefObject<HTMLDialogElement | null>;
};

export type ModalState<T extends ModalDefaultState = ModalDefaultState> = T;

export type UseModalOptions = {
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
   * @default false
   */
  disableCloseOnEscapePress?: boolean;
  /**
   * A general handler to do something after the dialog
   * full closes
   */
  onClose?: () => void;
};

/**
 * A custom hook that can turn any dialog element into a modal dialog.
 *
 * This hook provides a modal dialog with the ability to open, close, and handle specific events.
 * It integrates with the `usePortal` hook to manage the portal for rendering the modal dialog in the DOM.
 * The hook returns a set of properties and functions to control the modal's behavior.
 *
 * @example
 * // Example usage:
 * const modalRef = useRef(null);
 * const { dialogRef, Portal } = useModalDialog({
 *   ref: modalRef,
 *   closeOnBackdropClick: true,
 *   onClose: () => console.log('Modal closed'),
 * });
 *
 * return (
 *   <Portal>
 *     <dialog ref={dialogRef}>
 *       <p>Modal Content</p>
 *       <button onClick={() => modalRef.current.handleClose()}>Close</button>
 *     </dialog>
 *   </Portal>
 * );
 */
export const useModalDialog = <T extends ModalDefaultState = ModalDefaultState>(
  params: UseModalOptions & {
    ref: MutableRefObject<ModalRef<T>> | Ref<ModalRef<T>>;
  }
) => {
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const [dialogState, setModalState] = useState<ModalState<T>>();
  const [isOpen, setIsOpen] = useState(false);

  const handleCloseModal = useCallback(async () => {
    if (!modalRef.current) return;
    const dialogNode = modalRef.current;

    const onClose = params?.onClose ?? (() => void 0);

    // add the class close to the dialog to add any closing animations
    dialogNode.dataset.close = "true";

    // get the animations on the entire dialog and wait until they complete
    const animations = dialogNode.getAnimations({ subtree: true });
    await Promise.allSettled(animations.map((animation) => animation.finished));

    // close the dialog
    dialogNode.close();

    // Run any custom onClose function
    onClose();

    // Close and destroy the portal
    setIsOpen(false);
  }, [params?.onClose]);

  /**
   * This callbackRef is supplied to the dialog node in the dom.
   * Once this becomes available that means that the portal has been opened
   * and the dialog has rendered in the DOM. From here we run some stuff
   * that is associated with the dialog opening.
   */
  const dialogRef = useCallback<RefCallback<HTMLDialogElement>>(
    (dialogNode) => {
      if (!dialogNode) return;
      modalRef.current = dialogNode;

      // Reconcile some params
      const closeOnBackdropClick = params.closeOnBackdropClick ?? false;
      const disableCloseOnEscapePress =
        params.disableCloseOnEscapePress ?? false;

      // show the dialog as a modal dialog
      dialogNode.showModal();

      // Add some event listeners
      dialogNode.addEventListener("cancel", (e) => {
        // prevent the close event from firing.
        e.preventDefault();
        if (disableCloseOnEscapePress) return;
        handleCloseModal();
      });

      dialogNode.addEventListener("close", (e) => {
        // prevent the close event from firing.
        e.preventDefault();
        if (disableCloseOnEscapePress) return;
        handleCloseModal();
      });

      // short circuit
      if (!closeOnBackdropClick) return;

      // Close the dialog if the dialog::backdrop is clicked
      dialogNode.addEventListener("click", ({ target }) => {
        const { nodeName } = target as HTMLDialogElement;
        if (nodeName === "DIALOG") {
          handleCloseModal();
        }
      });
    },
    [
      handleCloseModal,
      params.closeOnBackdropClick,
      params.disableCloseOnEscapePress,
    ]
  );

  /**
   * Override the ref and add 2 functions to open and close
   * the dialog
   */
  useImperativeHandle(params.ref, () => {
    return {
      handleOpen(_, initState = {} as T) {
        setModalState(initState);
        setIsOpen(true);
      },
      handleClose: handleCloseModal,
      nodeRef: modalRef,
    };
  });

  return useMemo(
    () => ({
      isOpen,
      dialogRef,
      dialogState,
      closeModal: handleCloseModal,
    }),
    [handleCloseModal, dialogRef, dialogState, isOpen]
  );
};
