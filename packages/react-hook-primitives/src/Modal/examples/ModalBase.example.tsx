import { css } from "@linaria/core";

import { Modal } from "../Modal.js";
import { useModal } from "../modal.useModal.js";
const styles = css`
  /* Animation for appearing */
  @keyframes appear {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Animation for disappearing */
  @keyframes disappear {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.9);
    }
  }

  @keyframes fade-in {
    0% {
      opacity: 0;
      visibility: hidden;
    }
    100% {
      opacity: 1;
      visibility: visible;
    }
  }

  @keyframes fade-out {
    0% {
      opacity: 1;
      visibility: visible;
    }
    100% {
      opacity: 0;
      visibility: hidden;
    }
  }

  display: block;
  padding: 1rem;
  border: 0;
  transition: backdrop-filter 1s ease;
  display: grid;
  border-radius: 0.25rem;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;

  &::backdrop {
    transition: backdrop-filter 1s ease;
    backdrop-filter: blur(10px);
    background: rgba(0, 0, 0, 0.4);
  }

  @media (prefers-reduced-motion: no-preference) {
    &[open] {
      animation: appear 0.35s ease-in-out forwards;
      &::backdrop {
        animation: fade-in 0.35s ease-in-out forwards;
      }
    }
    &[data-close="true"] {
      animation: disappear 0.35s ease-in-out forwards;
      &::backdrop {
        animation: fade-out 0.35s ease-in-out forwards;
      }
    }
  }
`;

export default () => {
  const { modalRef, openModal } = useModal();

  return (
    <>
      <button type="button" onClick={openModal}>
        Open Modal
      </button>
      <Modal ref={modalRef} className={styles}>
        This is a basic modal
      </Modal>
    </>
  );
};
