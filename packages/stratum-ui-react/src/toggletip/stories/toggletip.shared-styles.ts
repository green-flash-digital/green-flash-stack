import { css } from "@linaria/core";

export const contentStyles = css`
  margin: 0;
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 0.5rem;
  background: #fff;
  font-size: 0.8125rem;
  max-width: 240px;
  box-shadow:
    0 14px 40px rgba(2, 6, 23, 0.12),
    0 6px 16px rgba(2, 6, 23, 0.1),
    0 2px 6px rgba(2, 6, 23, 0.08);

  opacity: 0;
  transform: translateY(-4px) scale(0.98);
  transition:
    opacity 0.12s,
    transform 0.12s,
    display 0.12s allow-discrete,
    overlay 0.12s allow-discrete;

  &:popover-open {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  @starting-style {
    &:popover-open {
      opacity: 0;
      transform: translateY(-4px) scale(0.98);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    transition: opacity 0.01s;
  }
`;

export const iconButtonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.375rem;
  height: 1.375rem;
  border-radius: 50%;
  border: 1px solid rgba(15, 23, 42, 0.25);
  background: #fff;
  font-size: 0.75rem;
  font-style: italic;
  font-family: Georgia, serif;
  color: #334155;
  cursor: pointer;

  &:hover {
    background: rgba(15, 23, 42, 0.04);
  }
`;
