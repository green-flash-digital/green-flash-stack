import { css } from "@linaria/core";
import { randBoolean, randSentence } from "@ngneat/falso";
import { type FC, useCallback } from "react";



import { classes } from "#/_utils/public/index.js";

import { Toaster } from "../Toaster.js";
import { useToast } from "../toast.useToast.js";
import type { ToastComponent } from "../toast.utils.js";



const divCSS = css`
  width: 400px;
  padding: 16px;
  border-radius: 8px;
  font-family: "Source Sans 3";

  &.success {
    background-color: #9addff;
  }

  &.error {
    background-color: #ffa2e9;
  }
`;

// define some common props
type MyToastProps = {
  variant: "success" | "error";
  message: string;
};

const toasterId = "best-practice-toaster";

// define the custom toast component
const MyToastComponent: ToastComponent<MyToastProps> = (props) => {
  return (
    <div className={classes(divCSS, props.variant)}>
      {props.message}
      <button type="button" onClick={props.closeToast}>
        close
      </button>
    </div>
  );
};

// re-define the Toaster component custom props
export const MyToaster: FC = () => {
  return <Toaster id={toasterId} ToastComponent={MyToastComponent} />;
};

// re-defined the useToast hook with custom props
export const useMyToast = () => {
  return useToast<MyToastProps>({ id: toasterId });
};

export default () => {
  const { create } = useMyToast();

  const createRandomToast = useCallback(() => {
    create({
      variant: randBoolean() ? "success" : "error",
      message: randSentence({ length: 1 }).toString(),
    });
  }, [create]);

  return (
    <>
      <button type="button" onClick={createRandomToast}>
        Create toast
      </button>
      <MyToaster />
    </>
  );
};
