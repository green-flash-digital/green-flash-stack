import { randSentence } from "@ngneat/falso";

import { Toaster } from "./Toast.js";

const meta = {
  title: "Toasts",
};
export default meta;

const Toast = new Toaster({
  toastDuration: 3,
  ToastComponent({ message }) {
    return <div>{message}</div>;
  },
});

export function Demo() {
  return (
    <>
      <Toast.Render />
      <button onClick={() => Toast.success({ message: randSentence() })}>
        Success
      </button>
    </>
  );
}
