import { css } from "@linaria/core";
import { randBoolean, randSentence } from "@ngneat/falso";
import { type FC, useCallback } from "react";

import { classes } from "#/_utils/public/index.js";
import { Toaster, useToast } from "#/Toast/index.js";

const divCSS = css`
  width: 400px;
  padding: 16px;
  border-radius: 8px;
  font-family: "Source Sans 3";

  &.success {
    background-color: #9aff9a;
  }

  &.error {
    background-color: #ffa3a3;
  }
`;

type ExampleToastProps = {
  variant: "success" | "error";
  message: string;
};

const ToastComponent: FC<ExampleToastProps> = (props) => {
  return <div className={classes(divCSS, props.variant)}>{props.message}</div>;
};

export default () => {
  const { create } = useToast<ExampleToastProps>();

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
      <Toaster ToastComponent={ToastComponent} />
    </>
  );
};
