import { usePortal } from "../usePortal.js";

export default () => {
  const { closePortal, togglePortal, Portal } = usePortal();

  return (
    <div>
      <button type="button" onClick={togglePortal}>
        Toggle Portal
      </button>
      <Portal>
        <div
          style={{
            zIndex: 10,
            position: "fixed",
            background: "red",
            top: 0,
          }}
        >
          Portal Content
          <button type="button" onClick={closePortal}>
            Close Portal
          </button>
        </div>
      </Portal>
    </div>
  );
};
