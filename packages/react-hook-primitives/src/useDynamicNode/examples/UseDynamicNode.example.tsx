import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useDynamicNode } from "../useDynamicNode.js";

export default () => {
  const { getDynamicNode, destroyNode } = useDynamicNode();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) destroyNode();
  }, [destroyNode, isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prevState) => !prevState)}
      >
        toggle
      </button>
      {isOpen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              background: "limegreen",
              top: "30%",
              left: "30%",
              padding: "2rem",
            }}
          >
            I&apos;m in a dynamic Node
          </div>,
          getDynamicNode()
        )}
    </>
  );
};
