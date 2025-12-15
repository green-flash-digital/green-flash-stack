import { css } from "@linaria/core";

import { Modal } from "../../Modal.js";
import { useModalContext } from "../../modal.useModalContext.js";

const styles = css`
  display: grid;
  grid-template-rows: auto 500px auto;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;

  & > * {
    padding: 0 2rem;
  }

  & > div {
    background: rgba(102, 51, 153, 0.1);
    padding: 1rem 2rem;
  }

  footer {
    height: 84px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
`;

export default function WithDefaultModalCustomStyles() {
  const { closeModal } = useModalContext();
  return (
    <Modal className={styles}>
      <header>
        <h2>Modal Header</h2>
      </header>
      <div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam nisi
        officiis repellat atque tempore doloribus tenetur odit voluptates
        sapiente, eaque delectus temporibus quidem sit debitis deleniti
        accusamus animi unde dicta!
      </div>
      <footer>
        <button type="button" onClick={closeModal}>
          Close
        </button>
      </footer>
    </Modal>
  );
}
