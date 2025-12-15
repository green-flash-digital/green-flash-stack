import { randSentence } from "@ngneat/falso";
import { css } from "@linaria/core";
import type { ToastState } from "@stratum-ui/core";
import { classes } from "@stratum-ui/core";

import { Toaster } from "./Toaster.js";

const meta = {
  title: "Toasts",
};
export default meta;

const ToastBasic = new Toaster({
  toastDuration: 3,
  ToastComponent({ message }) {
    return <div>{message}</div>;
  },
});

export function Basic() {
  return (
    <>
      <ToastBasic.Render />
      <button onClick={() => ToastBasic.success({ message: randSentence() })}>
        Success
      </button>
    </>
  );
}

const ToastContainerStyles = new Toaster({
  toastDuration: 3,
  containerClassName: css`
    background: red;
    padding: "1rem";
  `,
  ToastComponent({ message }) {
    return <div>{message}</div>;
  },
});
export function WithContainerStyles() {
  return (
    <>
      <ToastContainerStyles.Render />
      <button
        onClick={() =>
          ToastContainerStyles.success({ message: randSentence() })
        }
      >
        Success
      </button>
    </>
  );
}

const containerStyles = css`
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;

  & > div {
    display: contents;
  }
`;

const toastStyles = css`
  width: 100%;
  padding: 1rem;
  background: rebeccapurple;
  color: white;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  border-radius: 0.5rem;

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateY(-30px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  animation: toast-in 350ms cubic-bezier(0.32, 0.72, 0, 1.12);
`;

function ToastComponent({ message }: ToastState) {
  return <div className={toastStyles}>{message}</div>;
}

const ToastContainerComponent = new Toaster({
  toastDuration: 5,
  containerClassName: css`
    padding: "1rem";
  `,
  ToastContainer({ className, children }) {
    return (
      <div className={classes(containerStyles, className)}>{children}</div>
    );
  },
  ToastComponent,
});
export function WithContainerComponent() {
  return (
    <>
      <ToastContainerComponent.Render />
      <button
        onClick={() =>
          ToastContainerComponent.success({ message: randSentence() })
        }
      >
        Success
      </button>
    </>
  );
}
