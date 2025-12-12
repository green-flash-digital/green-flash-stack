import { Modal } from "../../Modal.js";
import { useModalContext } from "../../modal.useModalContext.js";

export type CustomState = { uuid: string };

export default function WithStateModal() {
  const {
    state: { uuid },
  } = useModalContext<CustomState>();

  return (
    <Modal>
      <header>
        <h2>With State</h2>
      </header>
      <dl>
        <dt>uuid</dt>
        <dd>{uuid}</dd>
      </dl>
    </Modal>
  );
}
