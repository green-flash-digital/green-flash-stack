import { css } from "@linaria/core";
import { makeRem, makeRgba } from "@machineq/theme";

export type ModalVariants = "modal" | "drawer-right" | "drawer-up";
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

const duration = ".3s";

export const modalStyleVariants: { [key in ModalVariants]: string } = {
  "drawer-right": css`
    @keyframes animate-open {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes animate-close {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100%);
      }
    }

    // Base
    position: fixed !important;
    top: 0;
    right: 0;
    left: unset;
    height: 100vh;
    width: max-content;
    margin: 0;
    max-height: unset;
    max-width: unset;
    border-top-left-radius: ${makeRem(8)};
    border-bottom-left-radius: ${makeRem(8)};

    // Open
    &[open] {
      animation: animate-open ${duration} ease-in-out;
    }

    // Close
    &.close {
      animation: animate-close ${duration} ease-in-out;
    }

    // Sizes
    &.sm {
      width: 20%;
    }
    &.md {
      width: 40%;
    }
    &.lg {
      width: 60%;
    }
    &.xl {
      width: 80%;
    }
  `,
  "drawer-up": css`
    @keyframes animate-open {
      from {
        opacity: 0;
        transform: translateY(100%);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes animate-close {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(100%);
      }
    }

    // Base
    position: fixed !important;
    top: unset;
    right: 0;
    left: 0;
    width: 100vw;
    height: auto;
    margin: 0;
    max-height: calc(100vh - 40px);
    max-width: unset;
    border-top-left-radius: ${makeRem(8)};
    border-top-right-radius: ${makeRem(8)};

    // Open
    &[open] {
      animation: animate-open ${duration} ease-in-out;
    }

    // Close
    &.close {
      animation: animate-close ${duration} ease-in-out;
    }
  `,
  modal: css`
    @keyframes animate-open {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes animate-close {
      from {
        opacity: 1;
        transform: scale(1);
      }
      to {
        opacity: 0;
        transform: scale(0.9);
      }
    }

    // Base
    margin: auto !important;
    box-shadow: 0px 4px 4px 0px #00000040;
    border-radius: ${makeRem(4)};

    // Open
    &[open] {
      animation: animate-open ${duration} ease-in-out;
    }

    // Close
    &.close {
      animation: animate-close ${duration} ease-in-out;
    }

    // Sizes
    &.sm {
      width: 30%;
    }
    &.md {
      width: 40%;
    }
    &.lg {
      width: 60%;
    }
    &.xl {
      width: 80%;
    }
    &.full {
      width: 100%;
      height: 100%;
      border-radius: 0;
      max-width: 100%;
      max-height: 100%;
    }
  `
};

export const modalStylesRoot = css`
  padding: 0;
  border: 0;
  margin: 0;

  @keyframes animate-open {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  @keyframes animate-close {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  // Base
  &::backdrop {
    background: ${makeRgba("black", 0.3)};
  }

  // Open
  &[open]::backdrop {
    animation: animate-open ${duration} ease-in-out;
  }

  // Close
  &.close::backdrop {
    animation: animate-close ${duration} ease-in-out;
  }
`;
