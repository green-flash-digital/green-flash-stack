import { randSentence } from "@ngneat/falso";
import { css } from "@linaria/core";
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

const toastStyles = css`
  width: 100%;
  padding: 1rem;
  background: rebeccapurple;
  color: white;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  border-radius: 0.5rem;
  &.error {
    background-color: red;
  }
  &.success {
    background-color: green;
  }

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

const ToasterWithContainerStyles = new Toaster({
  toastDuration: 5,
  containerProps: {
    id: "toaster-strudel",
    className: css`
      box-sizing: border-box;
      border: 0;
      margin: 0;
      position: fixed;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 500px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 0;

      * {
        box-sizing: border-box;
      }
    `,
  },
  ToastComponent({ message, variant }) {
    return <div className={classes(toastStyles, variant)}>{message}</div>;
  },
});
export function WithContainerStyles() {
  return (
    <>
      <ToasterWithContainerStyles.Render />
      <button
        onClick={() =>
          ToasterWithContainerStyles.success({ message: randSentence() })
        }
      >
        Success
      </button>
      <button
        onClick={() =>
          ToasterWithContainerStyles.error({
            message: "error!\n".concat(randSentence()),
          })
        }
      >
        Error
      </button>
    </>
  );
}
