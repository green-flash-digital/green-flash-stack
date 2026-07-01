import { makeSpace, makeRem, makeColor } from "@keystone-css/studio-tokens";
import type { LinariaClassName } from "@linaria/core";
import { css } from "@linaria/core";

import type { ModalType } from "./Modal";

export const modalBaseStyles = css`
  // Open state of the dialog
  &:open,
  &[open] {
    opacity: 1;
    visibility: visible;

    &::backdrop {
      opacity: 1;
      visibility: visible;
      backdrop-filter: blur(10px);
      background: rgba(0, 0, 0, 0.4);
    }
  }

  // Closed state
  padding: 0;
  border: 0;
  margin: 0;
  border: 0;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease-in-out allow-discrete;

  &::backdrop {
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease-in-out allow-discrete;
  }

  @starting-style {
    &:open,
    &[open] {
      opacity: 0;
      visibility: hidden;
    }
  }

  @starting-style {
    &:open::backdrop,
    &[open]::backdrop {
      opacity: 0;
      visibility: hidden;
    }
  }
`;

const drawerStyles = css`
  --drawer-width: 0;
  width: min-content;
  position: fixed;

  &.s {
    &-sm {
      --drawer-width: 20%;
      width: var(--drawer-width);
    }
    &-md {
      --drawer-width: 40%;
      width: var(--drawer-width);
    }
    &-lg {
      --drawer-width: 60%;
      width: var(--drawer-width);
    }
    &-xl {
      --drawer-width: 80%;
      width: var(--drawer-width);
    }
  }

  &.v {
    &-right {
      border-top-left-radius: ${makeSpace(4)};
      border-bottom-left-radius: ${makeSpace(4)};
      left: 100%;

      &:open,
      &[open] {
        display: grid;
        translate: -100%;
      }
    }
  }
`;

const defaultStyles = css`
  padding: 0;
  border: 0;
  margin: 0;
  margin: auto;
  border-radius: ${makeSpace(4)};
  transition: backdrop-filter 1s ease;
  filter: ${` drop-shadow(1px 2px 20px ${makeColor("neutral", {
    opacity: 0.5
  })})`};

  &.v {
    &-contain {
      display: grid;
      grid-template-rows: auto 1fr auto;
      height: 100%;
    }
  }

  &.s {
    &-sm {
      width: 20%;
    }
    &-md {
      width: 40%;
    }
    &-lg {
      width: 60%;
    }
    &-xl {
      width: 80%;
    }
    &-full {
      width: 100%;
      height: 100%;
    }
  }

  &::backdrop {
    transition: backdrop-filter 1s ease;
    /* backdrop-filter: blur(10px); */
    background: ${makeColor("neutral-dark", { opacity: 0.5 })};
  }

  /* Animation for appearing */
  @keyframes appear {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* Animation for disappearing */
  @keyframes disappear {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.9);
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

  @media (prefers-reduced-motion: no-preference) {
    &[open] {
      animation: appear 0.35s ease-in-out forwards;
      &::backdrop {
        animation: fade-in 0.35s ease-in-out forwards;
      }
    }
    &[data-close="true"] {
      animation: disappear 0.35s ease-in-out forwards;
      &::backdrop {
        animation: fade-out 0.35s ease-in-out forwards;
      }
    }
  }
`;

export const modalStyles: { [key in ModalType]: LinariaClassName } = {
  default: defaultStyles,
  drawer: drawerStyles
};
