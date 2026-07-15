import { css } from "@linaria/core";

/** The trigger button, styled to look like a text input rather than a button. */
export const triggerStyles = css`
  display: block;
  width: 220px;
  font: inherit;
  text-align: left;
  padding: 0.5rem 0.625rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(15, 23, 42, 0.16);
  background: #fff;
  cursor: pointer;
  color: #0f172a;

  &:hover {
    border-color: rgba(15, 23, 42, 0.28);
  }
  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 1px;
  }
`;

export const placeholderStyles = css`
  color: rgba(15, 23, 42, 0.45);
`;

/**
 * Same open/close transition technique as `menuChromeStyles` — see that
 * file's note on `@starting-style` + `allow-discrete` for why this is what
 * drives both native and programmatic dismiss.
 */
export const popoverChromeStyles = css`
  margin: 0;
  padding: 0.375rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 0.75rem;
  background: #fff;
  width: 220px;
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

export const searchInputStyles = css`
  display: block;
  width: 100%;
  font: inherit;
  padding: 0.5rem 0.625rem;
  margin-bottom: 0.375rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: rgba(15, 23, 42, 0.03);

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: -1px;
  }
`;

export const listboxStyles = css`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  max-height: 220px;
  overflow-y: auto;
`;

export const optionStyles = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #0f172a;

  &[aria-selected="true"] {
    background: rgba(37, 99, 235, 0.1);
  }
`;

export const emptyStateStyles = css`
  padding: 0.5rem 0.625rem;
  color: rgba(15, 23, 42, 0.45);
`;

export const loadingStateStyles = css`
  padding: 0.5rem 0.625rem;
  color: rgba(15, 23, 42, 0.45);
  font-style: italic;
`;

export const checkmarkStyles = css`
  color: #2563eb;
`;

export const formActionsStyles = css`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
`;

export const submitButtonStyles = css`
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

export const outputStyles = css`
  font-family: ui-monospace, monospace;
  font-size: 0.8125rem;
  background: rgba(15, 23, 42, 0.04);
  border-radius: 0.5rem;
  padding: 0.5rem 0.625rem;
  margin: 0;
`;
