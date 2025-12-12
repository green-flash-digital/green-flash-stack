import { Modal } from "../../Modal.js";

export default function WithDefaultDrawer() {
  return (
    <Modal cxVariant="drawer-up">
      <div style={{ height: 400 }}>Hello!</div>
    </Modal>
  );
}
