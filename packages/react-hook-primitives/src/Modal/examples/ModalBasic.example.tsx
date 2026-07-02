import { css } from "@linaria/core";
import { type FormEventHandler, useCallback } from "react";

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

  /* Animation for fading in the :backdrop */
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

  /* Animation for fading out the :backdrop */
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
  padding: 0;
  border: 0;
  transition: backdrop-filter 1s ease;
  display: grid;
  border-radius: 0.25rem;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;

  &::backdrop {
    transition: backdrop-filter 1s ease;
    backdrop-filter: blur(10px);
    background: rgba(0, 0, 0, 0.4);
  }

  width: 40ch;

  form {
    display: grid;
    grid-template-rows: 64px auto 64px;

    header,
    footer {
      align-content: center;
    }

    header {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 1rem;
      align-items: center;
    }

    footer {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 1rem;
    }

    .body {
      & > * {
        display: block;
        margin-top: 1rem;
      }
    }

    & > * {
      padding: 0 1rem;
    }
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
  const { modalRef, openModal, closeModal } = useModal();

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>((e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    alert(JSON.stringify(Object.fromEntries(formData.entries())));
  }, []);

  return (
    <>
      <button type="button" onClick={openModal}>
        Open Modal
      </button>
      <Modal ref={modalRef} className={styles}>
        <form onSubmit={handleSubmit}>
          <header>
            <h2>Enter user information</h2>
            <button type="button" onClick={closeModal}>
              close
            </button>
          </header>
          <div className="body">
            <fieldset>
              <legend>full name</legend>
              <label>
                <div>First Name</div>
                <input type="text" name="first_name" required />
              </label>
              <label>
                <div>Last Name</div>
                <input type="text" name="last_name" required />
              </label>
            </fieldset>
            <label>
              <div>Phone Number</div>
              <input type="tel" name="phone" required />
            </label>
          </div>
          <footer>
            <button type="button" onClick={closeModal}>
              Close
            </button>
            <button type="submit">Submit</button>
          </footer>
        </form>
      </Modal>
    </>
  );
};
