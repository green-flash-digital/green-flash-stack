import { css } from "@linaria/core";
import {
  randBoolean,
  randProductDescription,
  randSentence,
} from "@ngneat/falso";
import type { FC } from "react";



import { classes } from "#/_utils/public/index.js";

import { Toaster } from "../Toaster.js";
import { useToast } from "../toast.useToast.js";



const divCSS = css`
  width: 400px;
  padding: 16px;
  border-radius: 8px;
  font-family: "Source Sans 3";

  &.success {
    background-color: #9aff9d;
  }

  &.error {
    background-color: #ee9e9e;
  }

  &.info {
    background-color: #9addff;
  }

  &.warning {
    background-color: #b1a2ff;
  }
`;

// Define the 'Components' Toaster
type ComponentsToastProps = {
  variant: "success" | "error";
  message: string;
};
const componentsToasterId = "components-toaster";
export const useComponentsToast = () => {
  return useToast<ComponentsToastProps>({ id: componentsToasterId });
};
export const ComponentsToaster: FC = () => {
  return (
    <Toaster<ComponentsToastProps>
      id={componentsToasterId}
      ToastComponent={(props) => (
        <div className={classes(divCSS, props.variant)}>
          <h4>Components Toast</h4>
          {props.message}
          <button type="button" onClick={props.closeToast}>
            close
          </button>
        </div>
      )}
    />
  );
};

// Define the 'Features' Toaster
type FeaturesToastProps = {
  variant: "info" | "warning";
  message: string;
  feature: string;
};
const featuresToasterId = "features-toaster";
export const useFeaturesToast = () => {
  return useToast<FeaturesToastProps>({ id: featuresToasterId });
};
export const FeaturesToaster: FC = () => {
  return (
    <Toaster<FeaturesToastProps>
      id={featuresToasterId}
      ToastComponent={(props) => (
        <div className={classes(divCSS, props.variant)}>
          <h4>Features Toast</h4>
          <h5>Product: {props.feature}</h5>
          {props.message}
          <button type="button" onClick={props.closeToast}>
            close
          </button>
        </div>
      )}
    />
  );
};

export default () => {
  const { create: createComponentsToast } = useComponentsToast();
  const { create: createFeaturesToast } = useFeaturesToast();

  return (
    <>
      <button
        type="button"
        onClick={() =>
          createComponentsToast({
            variant: randBoolean() ? "success" : "error",
            message: randSentence({ length: 1 }).toString(),
          })
        }
      >
        Create Components toast
      </button>
      <ComponentsToaster />
      <button
        type="button"
        onClick={() =>
          createFeaturesToast({
            variant: randBoolean() ? "info" : "warning",
            feature: randProductDescription(),
            message: randSentence({ length: 1 }).toString(),
          })
        }
      >
        Create Features toast
      </button>
      <FeaturesToaster />
    </>
  );
};
