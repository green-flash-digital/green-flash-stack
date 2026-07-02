import { css } from "@linaria/core";

import { Drawer } from "../ModalDrawer.js";
import { useDrawer } from "../modal-drawer.useDrawer.js";

const drawerStyles = css`
  --drawer-width: 40%;

  /* Animations */
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

  @keyframes drawer-expand {
    0% {
      opacity: 0;
      transform: translateX(-100%);
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes drawer-collapse {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateX(-100%);
    }
  }

  /* Main Styles */
  display: block;
  padding: 0;
  border: 0;
  display: grid;
  margin: 0;
  border: 0;
  max-height: 100%;
  max-width: 100%;
  height: 100%;
  width: var(--drawer-width);

  &::backdrop {
    backdrop-filter: blur(10px);
    background: rgba(0, 0, 0, 0.4);
  }

  &.slide-right {
    &[open] {
      animation: drawer-expand 0.35s ease-in-out forwards;
      &::backdrop {
        animation: fade-in 0.35s ease-in-out forwards;
      }
    }
    &[data-close="true"] {
      animation: drawer-collapse 0.35s ease-in-out forwards;
      &::backdrop {
        animation: fade-out 0.35s ease-in-out forwards;
      }
    }
  }
`;

export default () => {
  const { drawerRef, openDrawer } = useDrawer();

  return (
    <>
      <button type="button" onClick={openDrawer}>
        Slide Right
      </button>
      <Drawer
        ref={drawerRef}
        dxOrientation="slide-right"
        className={drawerStyles}
      >
        This is some drawer content!
      </Drawer>
    </>
  );
};
