import { randSentence } from "@ngneat/falso";
import { css } from "@linaria/core";

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
