import { css } from "@linaria/core";

export type ModalVariants = "modal" | "drawer-right" | "drawer-up";
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

const duration = ".4s";
const durationClose = ".25s";
// Natural easing curves for smoother animations
const easeOut = "cubic-bezier(0.16, 1, 0.3, 1)"; // Smooth deceleration
const easeIn = "cubic-bezier(0.4, 0, 1, 1)"; // Quick acceleration

export const modalStyleVariants: { [key in ModalVariants]: string } = {
  "drawer-right": css`
    @keyframes animate-open {
      from {
        opacity: 0;
        transform: translateX(100%) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }

    @keyframes animate-close {
      from {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateX(100%) scale(0.98);
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
    border-top-left-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
    transform-origin: right center;

    // Open
    &[open] {
      animation: animate-open ${duration} ${easeOut};
    }

    // Close
    &.close {
      animation: animate-close ${durationClose} ${easeIn};
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
        transform: translateY(100%) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes animate-close {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateY(100%) scale(0.98);
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
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
    transform-origin: center bottom;

    // Open
    &[open] {
      animation: animate-open ${duration} ${easeOut};
    }

    // Close
    &.close {
      animation: animate-close ${durationClose} ${easeIn};
    }
  `,
  modal: css`
    @keyframes animate-open {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes animate-close {
      from {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      to {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
      }
    }

    // Base
    margin: auto !important;
    box-shadow: 0px 4px 4px 0px #00000040;
    border-radius: 0.25rem;
    transform-origin: center center;

    // Open
    &[open] {
      animation: animate-open ${duration} ${easeOut};
    }

    // Close
    &.close {
      animation: animate-close ${durationClose} ${easeIn};
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
  `,
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
    background: rgba(0, 0, 0, 0.3);
  }

  // Open
  &[open]::backdrop {
    animation: animate-open ${duration} ${easeOut};
  }

  // Close
  &.close::backdrop {
    animation: animate-close ${durationClose} ${easeIn};
  }
`;
