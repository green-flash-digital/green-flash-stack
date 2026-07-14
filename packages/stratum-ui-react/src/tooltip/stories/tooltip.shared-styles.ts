import { css } from "@linaria/core";

export const tooltipStyles = css`
  margin: 0;
  padding: 0.375rem 0.625rem;
  border: none;
  border-radius: 0.375rem;
  background: #0f172a;
  color: #fff;
  font-size: 0.8125rem;
  line-height: 1.3;
  max-width: 220px;
  pointer-events: none;

  opacity: 0;
  transform: translateY(-4px) scale(0.98);
  transition:
    opacity 0.1s ease-out,
    transform 0.1s ease-out,
    display 0.1s allow-discrete,
    overlay 0.1s allow-discrete;

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

export const triggerStyles = css`
  font: inherit;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid rgba(15, 23, 42, 0.12);
  background: #fff;
  cursor: default;

  &:hover {
    background: rgba(15, 23, 42, 0.04);
  }
`;
