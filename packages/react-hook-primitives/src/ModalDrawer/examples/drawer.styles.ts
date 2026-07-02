import { css } from "@linaria/core";
export default css`
  --drawer-width: 40%;

  display: block;
  padding: 0;
  border: 0;
  transition: backdrop-filter 1s ease;
  display: grid;
  margin: 0;
  border: 0;

  position: absolute;
  width: var(--drawer-width);

  &::backdrop {
    transition: backdrop-filter 1s ease;
    backdrop-filter: blur(10px);
    background: rgba(0, 0, 0, 0.4);
  }

  @media (prefers-reduced-motion: no-preference) {
    &[open] {
      &::backdrop {
        animation: fade-in 0.35s ease-in-out forwards;
      }
    }
    &[data-close="true"] {
      &::backdrop {
        animation: fade-out 0.35s ease-in-out forwards;
      }
    }
  }

  @keyframes slide-up {
    0% {
      opacity: 0;
      transform: translateY(100%);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-down {
    0% {
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      opacity: 0;
      transform: translateY(100%);
    }
  }

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

  &.right-to-left {
    @keyframes rtl-open {
      0% {
        opacity: 0;
        transform: translateX(100%);
      }
      100% {
        opacity: 1;
        transform: translateX(--drawer-width);
      }
    }

    @keyframes rtl-close {
      0% {
        opacity: 1;
        transform: translateX(--drawer-width);
      }
      100% {
        opacity: 0;
        transform: translateX(100%);
      }
    }

    left: calc(100% - var(--drawer-width));
    height: 100%;
    max-height: 100%;
    position: fixed;

    @media (prefers-reduced-motion: no-preference) {
      &[open] {
        animation: rtl-open 0.35s ease-in-out forwards;
        &::backdrop {
          animation: fade-in 0.35s ease-in-out forwards;
        }
      }
      &[data-close="true"] {
        animation: rtl-close 0.35s ease-in-out forwards;
        &::backdrop {
          animation: fade-out 0.35s ease-in-out forwards;
        }
      }
    }
  }

  &.left-to-right {
    @keyframes ltr-open {
      0% {
        opacity: 0;
        transform: -translateX(--drawer-width);
      }
      100% {
        opacity: 1;
        transform: translateX(100%);
      }
    }

    @keyframes ltr-close {
      0% {
        opacity: 1;
        transform: translateX(100%);
      }
      100% {
        opacity: 0;
        transform: -translateX(--drawer-width);
      }
    }

    left: calc(-1 * var(--drawer-width));
    height: 100%;
    max-height: 100%;
    position: fixed;

    @media (prefers-reduced-motion: no-preference) {
      &[open] {
        animation: ltr-open 0.35s ease-in-out forwards;
        &::backdrop {
          animation: fade-in 0.35s ease-in-out forwards;
        }
      }
      &[data-close="true"] {
        animation: ltr-close 0.35s ease-in-out forwards;
        &::backdrop {
          animation: fade-out 0.35s ease-in-out forwards;
        }
      }
    }
  }
`;
