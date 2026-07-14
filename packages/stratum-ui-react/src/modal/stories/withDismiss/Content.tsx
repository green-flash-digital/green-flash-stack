import { useModalContext } from "../../modal.useModalContext.js";

export type DismissState = { label: string };

export default function WithDismissContent() {
  const { state, closeModal, dismissModal } = useModalContext<DismissState>();

  return (
    <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h2>{state.label}</h2>
      <p>
        "Close" runs the caller&apos;s <code>onClose</code> callback. "Dismiss" (as if navigating
        away via a link inside the modal) closes without running it.
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button type="button" onClick={closeModal}>
          Close (fires onClose)
        </button>
        <button type="button" onClick={dismissModal}>
          Dismiss (no onClose)
        </button>
      </div>
    </div>
  );
}
