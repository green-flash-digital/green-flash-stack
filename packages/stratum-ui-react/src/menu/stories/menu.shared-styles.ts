import { css } from "@linaria/core";

/**
 * The current, correct way to animate a popover's open AND close (including
 * native dismiss — Escape, click-outside — which can't be intercepted in JS,
 * since `beforetoggle` isn't cancelable when closing). `transition` +
 * `allow-discrete` defers the element's removal from the top layer until the
 * transition finishes; `@starting-style` supplies the "from" state for the
 * entry transition. No JS animation-waiting or `.close`-class toggling needed
 * at all — the browser drives all of it off `:popover-open`.
 */
export const menuChromeStyles = css`
  margin: 0;
  padding: 0.375rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 0.75rem;
  background: #fff;
  min-width: 180px;
  max-width: min(320px, calc(100vw - 24px));
  outline: none;
  font-family:
    ui-sans-serif,
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    sans-serif;

  box-shadow:
    0 14px 40px rgba(2, 6, 23, 0.12),
    0 6px 16px rgba(2, 6, 23, 0.1),
    0 2px 6px rgba(2, 6, 23, 0.08);

  opacity: 0;
  transform: translateY(-6px) scale(0.98);
  transition:
    opacity 0.14s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.14s cubic-bezier(0.22, 1, 0.36, 1),
    display 0.14s allow-discrete,
    overlay 0.14s allow-discrete;

  &:popover-open {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  @starting-style {
    &:popover-open {
      opacity: 0;
      transform: translateY(-6px) scale(0.98);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: opacity 0.01s;
  }
`;

export const menuListStyles = css`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`;

export const menuItemStyles = css`
  display: block;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
  font: inherit;
  padding: 0.5rem 0.625rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #0f172a;

  &:hover,
  &:focus-visible {
    background: rgba(15, 23, 42, 0.06);
  }
  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: -2px;
  }
`;

export const triggerStyles = css`
  font: inherit;
  padding: 0.5rem 0.875rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #fff;
  cursor: pointer;

  &:hover {
    background: rgba(15, 23, 42, 0.04);
  }
`;
