import {
  type MouseEventHandler,
  type RefCallback,
  useCallback,
  useRef,
} from "react";

import { usePortal } from "../usePortal.js";

export default () => {
  const { openPortal, closePortal, Portal } = usePortal();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const divRef = useRef<HTMLDivElement | null>(null);

  // Once the content ref mounts, then this function will run which
  // will take the boundingRect of the button and position the content
  // of the portal near it.
  const setContentRef = useCallback<RefCallback<HTMLDivElement>>((node) => {
    if (!node || !buttonRef.current) return;
    const buttonRect = buttonRef.current.getBoundingClientRect();
    divRef.current = node;
    divRef.current.style.left = buttonRect.left.toString().concat("px");
    divRef.current.style.top = buttonRect.bottom.toString().concat("px");
  }, []);

  // Depending upon the existence of the divRef, this function will toggle
  // the appearance of the portal.
  const toggleContent = useCallback<MouseEventHandler<HTMLButtonElement>>(
    (e) => {
      buttonRef.current = e.currentTarget;
      if (divRef.current === null) {
        return openPortal();
      }
      closePortal();
      divRef.current = null;
    },
    [openPortal, closePortal]
  );

  return (
    <div>
      <button type="button" onClick={toggleContent}>
        Toggle Portal
      </button>
      <Portal>
        {/* This content can be dynamically imported */}
        <div
          ref={setContentRef}
          style={{
            position: "fixed",
            padding: "1rem",
            border: "1px solid red",
          }}
        >
          Portal Content
        </div>
      </Portal>
    </div>
  );
};
