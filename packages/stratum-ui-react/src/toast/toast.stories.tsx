import { useState } from "react";

import { css } from "@linaria/core";
import { randSentence } from "@ngneat/falso";
import type { Meta } from "@storybook/react-vite";
import { classes } from "@stratum-ui/core";

import type { ToastComponentProps } from "./Toaster.js";
import { Toaster } from "./Toaster.js";

const meta: Meta = {
  title: "Toasts",
  parameters: {
    layout: "centered"
  }
};
export default meta;

const closeButtonStyles = css`
  all: unset;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  opacity: 0.7;
  padding: 0 0.125rem;

  &:hover {
    opacity: 1;
  }
  &:focus-visible {
    outline: 2px solid white;
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

/**
 * `close`/`pause`/`resume` and `duration` are the four toast props beyond
 * `message`/`variant`/`id` worth knowing about: `close` dismisses the toast
 * immediately (a close button), `pause`/`resume` stop and restart its
 * auto-dismiss timer (wired to hover here, so a toast doesn't vanish while
 * someone's still reading it), and `duration` (seconds, `undefined` if this
 * toast doesn't auto-dismiss — `error`/`critical` never do) is what drives
 * the shrinking progress bar below.
 */
export function Basic() {
  const [toaster] = useState(
    () =>
      new Toaster({
        toastDuration: 3,
        ToastComponent({ message, close }) {
          return (
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <span>{message}</span>
              <button type="button" onClick={close} aria-label="Dismiss">
                ×
              </button>
            </div>
          );
        }
      })
  );

  return (
    <>
      <toaster.Render />
      <button onClick={() => toaster.success({ message: randSentence() })}>Success</button>
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

const toastBodyStyles = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
`;

const progressBarStyles = css`
  height: 3px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 2px;
  margin-top: 0.625rem;
  animation-name: shrink;
  animation-timing-function: linear;
  animation-fill-mode: forwards;

  @keyframes shrink {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`;

/**
 * The full-featured toast: a close button, and hover-to-pause wired to both
 * the engine's actual dismiss timer (`pause`/`resume`) AND the progress bar's
 * own CSS animation (`animationPlayState`) via the same local hover flag —
 * the two are independent (pausing the timer doesn't automatically pause a
 * CSS animation), so a toast that visually looks paused actually is.
 */
function ToastWithControls({ message, duration, close, pause, resume }: ToastComponentProps) {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      onMouseEnter={() => {
        setIsPaused(true);
        pause();
      }}
      onMouseLeave={() => {
        setIsPaused(false);
        resume();
      }}
    >
      <div className={toastBodyStyles}>
        <span>{message}</span>
        <button type="button" className={closeButtonStyles} onClick={close} aria-label="Dismiss">
          ×
        </button>
      </div>
      {duration !== undefined && (
        <div
          className={progressBarStyles}
          style={{
            animationDuration: `${duration}s`,
            animationPlayState: isPaused ? "paused" : "running"
          }}
        />
      )}
    </div>
  );
}

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
  ToastComponent(props) {
    return (
      <div className={classes(toastStyles, toastStylesSlideDown, props.variant)}>
        <ToastWithControls {...props} />
      </div>
    );
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
  ToastComponent(props) {
    return (
      <div className={classes(toastStyles, stylesToastSlideIn, props.variant)}>
        <ToastWithControls {...props} />
      </div>
    );
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
