import { css } from "@linaria/core";
import {
  type FC,
  type ReactNode,
  type RefCallback,
  useCallback,
  useEffect,
} from "react";

import { classes } from "#/_utils/public/index.js";

export type ToastProps = {
  id: string;
};

const divCSS = css`
  opacity: 0;
  transition: all 0.15s ease-in-out;
  padding: 0;
  border: none;

  &.open {
    opacity: 1;
  }

  &:popover-open {
    position: fixed;
    inset: unset;
    right: 32px;
    bottom: 0;
    margin: 0;
    inset-inline-start: unset;
  }
`;

export const Toast: FC<
  ToastProps & { className?: string; children: ReactNode }
> = ({ children, id }) => {
  const ref = useCallback<RefCallback<HTMLDivElement>>((node) => {
    if (!node) return;
    node.popover = "manual";
    // @ts-expect-error open is a valid item
    node.open = true;
    node.showPopover();
    node.classList.add("open");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const allToasts = document.querySelectorAll(
      ".toast"
    ) as NodeListOf<HTMLElement>;

    for (let i = allToasts.length - 1; i >= 0; i--) {
      const toast = allToasts[i];
      const nextToastsHeight = Array.from(allToasts)
        .slice(i + 1)
        .reduce((acc, curr) => acc + curr.clientHeight + 32, 32);
      toast.style.bottom = `${nextToastsHeight}px`;
    }
  }, []);

  return (
    <div ref={ref} className={classes("toast", divCSS)} id={id}>
      {children}
    </div>
  );
};
