import type { FormEventHandler } from "react";
import { useCallback } from "react";
import { useDropdownMenu, useToggle } from "react-hook-primitives";

import { makeSpace, makeColor, makePx, makeRem, makeReset } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { Button } from "~/components/Button";
import { Dropdown } from "~/components/Dropdown";
import { InputGroup } from "~/components/InputGroup";
import { InputLabel } from "~/components/InputLabel";
import { InputNumber } from "~/components/InputNumber";
import { InputText } from "~/components/InputText";
import { VariantContainer } from "~/components/VariantContainer";
import { VariantContainerBar } from "~/components/VariantContainerBar";
import { VariantContainerBarActions } from "~/components/VariantContainerBarActions";
import { VariantContainerBarTitle } from "~/components/VariantContainerBarTitle";
import { VariantContainerContent } from "~/components/VariantContainerContent";
import { IconInsertRow } from "~/icons/IconInsertRow";
import { IconPlusSign } from "~/icons/IconPlusSign";

import type { ConfigurationStateResponseBreakpointValue } from "../studio.state";

export type OnResponseBreakpointAction = (
  options:
    | { action: "addBreakpoint" }
    | { action: "addBreakpointDirection"; direction: "above" | "below"; referenceIndex: number }
    | { action: "deleteBreakpoint"; id: string }
    | { action: "updateBreakpoint"; id: string; name: string; value: number }
) => void;

const barStyles = css`
  grid-template-columns: ${makeRem(100)} 1fr auto !important;

  .save {
    color: ${makeColor("success-600")};
  }

  .delete {
    color: ${makeColor("danger-200")};
  }
`;

const contentStyles = css`
  .footer {
    display: flex;
    gap: ${makeSpace(8)};
  }
`;

const dropdownStyles = css`
  ul {
    ${makeReset("ul")};
    display: flex;
    flex-direction: column;
    gap: ${makeSpace(4)};

    button {
      background: transparent;
      &:hover {
        background: ${makeColor("neutral-light", { opacity: 0.1 })};
      }
    }
  }
`;

export function BreakpointConfigVariant({
  breakpoint,
  breakpointId,
  breakpointIndex,
  onAction
}: {
  breakpointId: string;
  breakpointIndex: number;
  breakpoint: ConfigurationStateResponseBreakpointValue;
  onAction: OnResponseBreakpointAction;
}) {
  const [isEditing, toggle] = useToggle();

  const handleDelete = useCallback(() => {
    onAction({ action: "deleteBreakpoint", id: breakpointId });
  }, [breakpointId, onAction]);

  const { setDropdownRef, setTargetRef, closeMenu } = useDropdownMenu<
    HTMLDivElement,
    HTMLDivElement
  >({
    dxArrow: {
      size: 16,
      color: "inherit"
    }
  });

  const addVariantAbove = useCallback(() => {
    onAction({
      action: "addBreakpointDirection",
      direction: "above",
      referenceIndex: breakpointIndex
    });
    closeMenu();
  }, [breakpointIndex, closeMenu, onAction]);

  const addVariantBelow = useCallback(() => {
    onAction({
      action: "addBreakpointDirection",
      direction: "below",
      referenceIndex: breakpointIndex
    });
    closeMenu();
  }, [breakpointIndex, closeMenu, onAction]);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    (e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const name = formData.get("name");
      const value = formData.get("value");

      onAction({
        action: "updateBreakpoint",
        id: breakpointId,
        name: String(name),
        value: Number(value)
      });
      toggle();
    },
    [breakpointId, onAction, toggle]
  );

  return (
    <VariantContainer>
      <VariantContainerBar className={barStyles}>
        <VariantContainerBarTitle>{breakpoint.name}</VariantContainerBarTitle>
        <div>{makePx(breakpoint.value)}</div>
        <VariantContainerBarActions
          dxIsEditing={isEditing}
          dxOnDelete={handleDelete}
          dxOnEdit={toggle}
        >
          <div>
            <Button ref={setTargetRef} dxVariant="icon" DXIcon={IconInsertRow} dxSize="dense" />
            <Dropdown ref={setDropdownRef} className={dropdownStyles}>
              <ul>
                <li>
                  <Button
                    dxVariant="text"
                    dxSize="dense"
                    DXIconStart={IconPlusSign}
                    onClick={addVariantAbove}
                  >
                    Insert 1 row above
                  </Button>
                </li>
                <li>
                  <Button
                    dxVariant="text"
                    dxSize="dense"
                    DXIconStart={IconPlusSign}
                    onClick={addVariantBelow}
                  >
                    Insert 1 row below
                  </Button>
                </li>
              </ul>
            </Dropdown>
          </div>
        </VariantContainerBarActions>
      </VariantContainerBar>
      {isEditing ? (
        <VariantContainerContent className={contentStyles}>
          <form onSubmit={handleSubmit}>
            <InputGroup>
              <InputLabel dxSize="dense" dxLabel="Breakpoint name">
                <InputText defaultValue={breakpoint.name} name="name" dxSize="dense" />
              </InputLabel>
              <InputLabel dxSize="dense" dxLabel="Value">
                <InputNumber dxSize="dense" min={0} defaultValue={breakpoint.value} name="value" />
              </InputLabel>
              <div className="footer">
                <Button dxVariant="contained" dxSize="dense" type="submit">
                  Save
                </Button>
                <Button dxVariant="outlined" dxSize="dense">
                  Cancel
                </Button>
              </div>
            </InputGroup>
          </form>
        </VariantContainerContent>
      ) : null}
    </VariantContainer>
  );
}
