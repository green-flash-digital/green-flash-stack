import { css } from "@linaria/core";
import { randSentence } from "@ngneat/falso";
import type { Meta } from "@storybook/react-vite";
import { classes } from "@stratum-ui/core";

import { Toaster } from "./Toaster.js";

const meta: Meta = {
  title: "Toasts",
  parameters: {
    layout: "centered"
  }
};
export default meta;

const ToastBasic = new Toaster({
  toastDuration: 3,
  ToastComponent({ message }) {
    return <div>{message}</div>;
  }
});

export function Basic() {
  return (
    <>
      <ToastBasic.Render />
      <button onClick={() => ToastBasic.success({ message: randSentence() })}>Success</button>
    </>
  );
}

const toastStyles = css`
  width: 100%;
  padding: 1rem;
  background: rebeccapurple;
  color: white;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    "Open Sans",
    "Helvetica Neue",
    sans-serif;
  border-radius: 0.5rem;
  &.error {
    background-color: red;
  }
  &.success {
    background-color: green;
  }
`;

const toastStylesSlideDown = css`
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

const ToasterWithTopDown = new Toaster({
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
    `
  },
  ToastComponent({ message, variant }) {
    return <div className={classes(toastStyles, toastStylesSlideDown, variant)}>{message}</div>;
  }
});
export function WithTopDown() {
  return (
    <>
      <ToasterWithTopDown.Render />
      <button onClick={() => ToasterWithTopDown.success({ message: randSentence() })}>
        Success
      </button>
      <button
        onClick={() =>
          ToasterWithTopDown.error({
            message: "error!\n".concat(randSentence())
          })
        }
      >
        Error
      </button>
    </>
  );
}

const stylesToastSlideIn = css`
  @keyframes toast-slide-in {
    from {
      opacity: 0;
      transform: translateX(30px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }
  animation: toast-slide-in 350ms cubic-bezier(0.32, 0.72, 0, 1.12);
`;

const ToasterWithBottomRightUp = new Toaster({
  toastDuration: 5,
  containerProps: {
    id: "toaster-strudel",
    className: css`
      box-sizing: border-box;
      border: 0;
      margin: 0;
      position: fixed;
      top: unset;
      left: unset;
      bottom: 0;
      right: 0;
      width: 400px;
      display: flex;
      flex-direction: column; // this is important
      gap: 1rem;
      padding: 1rem;

      * {
        box-sizing: border-box;
      }

      ${stylesToastSlideIn};
    `
  },
  ToastComponent({ message, variant }) {
    return <div className={classes(toastStyles, stylesToastSlideIn, variant)}>{message}</div>;
  }
});
export function WithBottomRight() {
  return (
    <>
      <ToasterWithBottomRightUp.Render />
      <button onClick={() => ToasterWithBottomRightUp.success({ message: randSentence() })}>
        Success
      </button>
      <button
        onClick={() =>
          ToasterWithBottomRightUp.error({
            message: "error!\n".concat(randSentence())
          })
        }
      >
        Error
      </button>
    </>
  );
}
