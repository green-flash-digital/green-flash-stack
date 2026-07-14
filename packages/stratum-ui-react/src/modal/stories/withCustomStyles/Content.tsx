import { useModalContext } from "../../modal.useModalContext.js";

export default function WithDefaultModalCustomStyles() {
  const { closeModal } = useModalContext();
  return (
    <>
      <header>
        <h2>Modal Header</h2>
      </header>
      <div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam nisi officiis repellat atque
        tempore doloribus tenetur odit voluptates sapiente, eaque delectus temporibus quidem sit
        debitis deleniti accusamus animi unde dicta!
      </div>
      <footer>
        <button type="button" onClick={closeModal}>
          Close
        </button>
      </footer>
    </>
  );
}
