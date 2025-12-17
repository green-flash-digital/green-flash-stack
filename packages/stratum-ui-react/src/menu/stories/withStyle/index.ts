import { css } from "@linaria/core";

import { MenuController } from "../../MenuController.js";

const className = css`
  margin: 0;
  padding: 0.5rem;
  border: 1px solid rgba(15, 23, 42, 0.08); /* subtle, not heavy */
  border-radius: 0.75rem;
  background: #fff;
  min-width: 200px;
  max-width: min(320px, calc(100vw - 24px));
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
    "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif;

  box-shadow: 0 14px 40px rgba(2, 6, 23, 0.12), 0 6px 16px rgba(2, 6, 23, 0.1),
    0 2px 6px rgba(2, 6, 23, 0.08);

  /* Popover baseline */
  outline: none;
  user-select: none;

  /* Animation: fast + premium */
  transform-origin: top;
  animation: actionMenuIn 140ms cubic-bezier(0.22, 1, 0.36, 1) both;

  &.close {
    animation: actionMenuOut 110ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes actionMenuIn {
    from {
      opacity: 0;
      transform: translateY(-6px) scale(0.98);
      filter: blur(0.3px); /* tiny polish, optional */
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
      filter: blur(0);
    }
  }

  @keyframes actionMenuOut {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(-4px) scale(0.985);
    }
  }

  /* Reduce motion */
  @media (prefers-reduced-motion: reduce) {
    .actionMenu,
    .actionMenu.close {
      animation: none;
    }
  }
`;

export const MenuWithStyle = new MenuController({
  className,
  position: "bottom-span-right",
  offset: 10,
  load: () => import("./content.js"),
});
