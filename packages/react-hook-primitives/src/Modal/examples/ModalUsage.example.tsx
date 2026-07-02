import { Modal } from "../Modal.js";
import { useModal } from "../modal.useModal.js";

export default function ModalUsage() {
  const { modalRef, openModal } = useModal();

  return (
    <>
      <button type="button" onClick={openModal}>
        Open a bare bones example
      </button>
      <Modal ref={modalRef}>
        This is the simplest implementation of a modal
      </Modal>
    </>
  );
}
