import React from "react";

import { css } from "@linaria/core";
import type { ModalState } from "@stratum-ui/core";

import type { ModalProps } from "./ModalController.js";

export type ModalVariants = "modal" | "drawer-right" | "drawer-up" | "drawer-left" | "drawer-down";
export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export type ModalControllerContextType<S extends ModalState> = {
  state: S;
  /**
   * Closes the modal and fires the `onClose` callback passed to `launch()`.
   * Use for explicit user-initiated close actions: X button, Escape, Cancel.
   */
  closeModal: () => Promise<void>;
  /**
   * Closes the modal without firing the `onClose` callback.
   * Use when the user navigates away via a link inside the modal.
   */
  dismissModal: () => Promise<void>;
  props: ModalProps;
};

export const ModalControllerContext =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.createContext<ModalControllerContextType<any> | null>(null);

/**
 * Single source of truth for every CSS custom property the built-in variants expose
 * for theming. Each is read via `var(--name, <default below>)` at its usage site, so
 * an app can override any of them — per-instance via `props.style`/`props.className`,
 * or globally via a `:root` rule — without forking the variant CSS.
 *
 * {@link modalThemeStylesheet} prints these as a ready-to-paste `:root` block.
 */
export const modalThemeTokens = {
  "--modal-duration-open": ".4s",
  "--modal-duration-close": ".25s",
  "--modal-ease-out": "cubic-bezier(0.16, 1, 0.3, 1)",
  "--modal-ease-in": "cubic-bezier(0.4, 0, 1, 1)",
  "--modal-backdrop": "rgba(0, 0, 0, 0.3)",
  "--modal-backdrop-filter": "none",
  /**
   * Guards against a collapsed, invisible dialog while lazy-loaded content is
   * still in flight (the "modal"/"drawer-up"/"drawer-down" variants size to
   * their content, so with nothing rendered yet — the default `null` Suspense
   * fallback — they'd otherwise sit at ~0 height and the open animation would
   * play on nothing). Doesn't apply to `drawer-right`/`drawer-left`, which are
   * always pinned to `height: 100vh`.
   */
  "--modal-min-height": "8rem",
  "--modal-radius": "0.25rem",
  "--modal-drawer-radius": "0.5rem",
  "--modal-shadow": "0px 4px 4px 0px #00000040"
} as const;

/**
 * A ready-to-paste `:root { ... }` block containing every theme-able custom property
 * and its built-in default, for apps that want to see (and override) exactly what's
 * customizable without reading the source.
 */
export const modalThemeStylesheet = `:root {\n${Object.entries(modalThemeTokens)
  .map(([name, value]) => `  ${name}: ${value};`)
  .join("\n")}\n}`;

const t = modalThemeTokens;

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
    position: fixed;
    top: 0;
    right: 0;
    left: unset;
    height: 100vh;
    width: max-content;
    margin: 0;
    max-height: unset;
    max-width: unset;
    border-top-left-radius: var(--modal-drawer-radius, ${t["--modal-drawer-radius"]});
    border-bottom-left-radius: var(--modal-drawer-radius, ${t["--modal-drawer-radius"]});
    transform-origin: right center;

    // Open
    &[open] {
      animation: animate-open var(--modal-duration-open, ${t["--modal-duration-open"]})
        var(--modal-ease-out, ${t["--modal-ease-out"]});
    }

    // Close
    &.close {
      animation: animate-close var(--modal-duration-close, ${t["--modal-duration-close"]})
        var(--modal-ease-in, ${t["--modal-ease-in"]});
    }

    // Sizes
    &.modal-size-sm {
      width: 20%;
    }
    &.modal-size-md {
      width: 40%;
    }
    &.modal-size-lg {
      width: 60%;
    }
    &.modal-size-xl {
      width: 80%;
    }
  `,
  "drawer-left": css`
    @keyframes animate-open {
      from {
        opacity: 0;
        transform: translateX(-100%) scale(0.98);
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
        transform: translateX(-100%) scale(0.98);
      }
    }

    // Base
    position: fixed;
    top: 0;
    left: 0;
    right: unset;
    height: 100vh;
    width: max-content;
    margin: 0;
    max-height: unset;
    max-width: unset;
    border-top-right-radius: var(--modal-drawer-radius, ${t["--modal-drawer-radius"]});
    border-bottom-right-radius: var(--modal-drawer-radius, ${t["--modal-drawer-radius"]});
    transform-origin: left center;

    // Open
    &[open] {
      animation: animate-open var(--modal-duration-open, ${t["--modal-duration-open"]})
        var(--modal-ease-out, ${t["--modal-ease-out"]});
    }

    // Close
    &.close {
      animation: animate-close var(--modal-duration-close, ${t["--modal-duration-close"]})
        var(--modal-ease-in, ${t["--modal-ease-in"]});
    }

    // Sizes
    &.modal-size-sm {
      width: 20%;
    }
    &.modal-size-md {
      width: 40%;
    }
    &.modal-size-lg {
      width: 60%;
    }
    &.modal-size-xl {
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
    position: fixed;
    top: unset;
    right: 0;
    left: 0;
    width: 100vw;
    height: auto;
    min-height: var(--modal-min-height, ${t["--modal-min-height"]});
    margin: 0;
    max-height: calc(100vh - 40px);
    max-width: unset;
    border-top-left-radius: var(--modal-drawer-radius, ${t["--modal-drawer-radius"]});
    border-top-right-radius: var(--modal-drawer-radius, ${t["--modal-drawer-radius"]});
    transform-origin: center bottom;

    // Open
    &[open] {
      animation: animate-open var(--modal-duration-open, ${t["--modal-duration-open"]})
        var(--modal-ease-out, ${t["--modal-ease-out"]});
    }

    // Close
    &.close {
      animation: animate-close var(--modal-duration-close, ${t["--modal-duration-close"]})
        var(--modal-ease-in, ${t["--modal-ease-in"]});
    }
  `,
  "drawer-down": css`
    @keyframes animate-open {
      from {
        opacity: 0;
        transform: translateY(-100%) scale(0.98);
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
        transform: translateY(-100%) scale(0.98);
      }
    }

    // Base
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: unset;
    width: 100vw;
    height: auto;
    min-height: var(--modal-min-height, ${t["--modal-min-height"]});
    margin: 0;
    max-height: calc(100vh - 40px);
    max-width: unset;
    border-bottom-left-radius: var(--modal-drawer-radius, ${t["--modal-drawer-radius"]});
    border-bottom-right-radius: var(--modal-drawer-radius, ${t["--modal-drawer-radius"]});
    transform-origin: center top;

    // Open
    &[open] {
      animation: animate-open var(--modal-duration-open, ${t["--modal-duration-open"]})
        var(--modal-ease-out, ${t["--modal-ease-out"]});
    }

    // Close
    &.close {
      animation: animate-close var(--modal-duration-close, ${t["--modal-duration-close"]})
        var(--modal-ease-in, ${t["--modal-ease-in"]});
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
    margin: auto;
    min-height: var(--modal-min-height, ${t["--modal-min-height"]});
    box-shadow: var(--modal-shadow, ${t["--modal-shadow"]});
    border-radius: var(--modal-radius, ${t["--modal-radius"]});
    transform-origin: center center;

    // Open
    &[open] {
      animation: animate-open var(--modal-duration-open, ${t["--modal-duration-open"]})
        var(--modal-ease-out, ${t["--modal-ease-out"]});
    }

    // Close
    &.close {
      animation: animate-close var(--modal-duration-close, ${t["--modal-duration-close"]})
        var(--modal-ease-in, ${t["--modal-ease-in"]});
    }

    // Sizes
    &.modal-size-sm {
      width: 30%;
    }
    &.modal-size-md {
      width: 40%;
    }
    &.modal-size-lg {
      width: 60%;
    }
    &.modal-size-xl {
      width: 80%;
    }
    &.modal-size-full {
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
    background: var(--modal-backdrop, ${t["--modal-backdrop"]});
    backdrop-filter: var(--modal-backdrop-filter, ${t["--modal-backdrop-filter"]});
  }

  // Open
  &[open]::backdrop {
    animation: animate-open var(--modal-duration-open, ${t["--modal-duration-open"]})
      var(--modal-ease-out, ${t["--modal-ease-out"]});
  }

  // Close
  &.close::backdrop {
    animation: animate-close var(--modal-duration-close, ${t["--modal-duration-close"]})
      var(--modal-ease-in, ${t["--modal-ease-in"]});
  }
`;
