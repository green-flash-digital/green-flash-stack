import type { JSX, MouseEventHandler } from "react";
import { forwardRef } from "react";
import { classes } from "react-hook-primitives";

import { makeSpace, makeColor, makeRem } from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { IconDelete } from "~/icons/IconDelete";
import { IconPencilEdit01 } from "~/icons/IconPencilEdit01";
import { IconTick01 } from "~/icons/IconTick01";

import { Button } from "./Button";

export type VariantContainerBarActionsPropsNative = JSX.IntrinsicElements["div"];
export type VariantContainerBarActionsPropsCustom = {
  dxOnEdit: MouseEventHandler<HTMLButtonElement>;
  dxOnDelete: MouseEventHandler<HTMLButtonElement>;
  dxIsEditing: boolean;
};
export type VariantContainerBarActionsProps = VariantContainerBarActionsPropsNative &
  VariantContainerBarActionsPropsCustom;

const styles = css`
  display: flex;
  gap: ${makeSpace(4)};
  justify-content: flex-end;
  align-items: center;

  .delete {
    color: ${makeColor("danger")};
  }

  .done {
    color: ${makeColor("success-600")};
  }
`;

export const VariantContainerBarActions = forwardRef<
  HTMLDivElement,
  VariantContainerBarActionsProps
>(function VariantContainerBarActions(
  { children, className, dxOnEdit, dxOnDelete, dxIsEditing, ...restProps },
  ref
) {
  return (
    <div {...restProps} className={classes(styles, className)} ref={ref}>
      {children}
      <Button
        dxVariant="icon"
        DXIcon={dxIsEditing ? IconTick01 : IconPencilEdit01}
        onClick={dxOnEdit}
        dxSize="dense"
        className={classes({
          done: dxIsEditing
        })}
        dxHelp={dxIsEditing ? "Done editing" : "Edit variant"}
      />
      <Button
        dxVariant="icon"
        DXIcon={IconDelete}
        onClick={dxOnDelete}
        dxSize="dense"
        className="delete"
        dxHelp="Delete variant"
      />
    </div>
  );
});
