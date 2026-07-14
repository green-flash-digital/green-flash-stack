import type { JSX } from "react";
import { forwardRef } from "react";

import {
  makeSpace,
  makeColor,
  makeCustom,
  makeFontFamily,
  makeFontWeight,
  makeRem,
  makeReset
} from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

import { IconCancel } from "~/icons/IconCancel";

import { useModalContext } from "./Modal.provider";

export type ModalHeaderPropsNative = Omit<JSX.IntrinsicElements["header"], "children">;
export type ModalHeaderPropsCustom = {
  dxHideClose?: boolean;
  dxSubtitle?: string;
  children: string;
};
export type ModalHeaderProps = ModalHeaderPropsNative & ModalHeaderPropsCustom;

const styles = css`
  padding: ${makeCustom("modal-gutters")};
  display: flex;
  gap: ${makeSpace(24)};
  width: 100%;

  & > div {
    flex: 1;
  }

  .title {
    flex: 1;
    font-size: ${makeSpace(20)};
    font-family: ${makeFontFamily("mulish")};
    font-weight: ${makeFontWeight("mulish-bold")};
    line-height: 1;
  }

  .subtitle {
    font-size: ${makeSpace(16)};
    margin-top: ${makeSpace(12)};
    color: ${makeColor("neutral-light", { opacity: 0.8 })};
    font-family: ${makeFontFamily("mulish")};
    font-weight: ${makeFontWeight("mulish-regular")};
    max-width: 70ch;
    line-height: 1.4;
  }

  button {
    ${makeReset("button")};
    height: ${makeSpace(24)};
    aspect-ratio: 1 / 1;
    display: grid;
    place-content: center;
    border-radius: ${makeSpace(4)};
  }
`;
export const ModalHeader = forwardRef<HTMLElement, ModalHeaderProps>(function ModalHeader(
  { children, className, dxHideClose = false, dxSubtitle, ...restProps },
  ref
) {
  const { close } = useModalContext();
  return (
    <header {...restProps} className={classes(styles, className)} ref={ref}>
      <div>
        <div className="title">{children}</div>
        {dxSubtitle && <div className="subtitle">{dxSubtitle}</div>}
      </div>
      {!dxHideClose && (
        <button onClick={close} autoFocus>
          <IconCancel dxSize={24} />
        </button>
      )}
    </header>
  );
});
