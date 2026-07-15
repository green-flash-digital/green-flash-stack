import { useEffect, useRef, useState } from "react";
import { useMenu } from "@stratum-ui/react/menu";

import { makeSpace, makeColor, makeFontWeight, makeRem } from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

import { Button } from "~/components/Button";
import { ButtonIcon } from "~/components/ButtonIcon";
import { DropdownMenu } from "~/components/DropdownMenu";
import { DropdownMenuItem } from "~/components/DropdownMenuItem";
import { createDropdownStyles } from "~/components/shared-styles";
import { IconArrowDown } from "~/icons/IconArrowDown";
import { IconFloppyDisk } from "~/icons/IconFloppyDisk";
import { IconInspectCode } from "~/icons/IconInspectCode";
import { IconMoreHorizontal } from "~/icons/IconMoreHorizontal";
import { IconSettings05 } from "~/icons/IconSettings05";

import { useConfigurationContext } from "./Config.context";
import { useSaveConfig } from "./config.useSave";
import { configDiffModalController } from "./ConfigDiffModal.controller";
import { configSettingsModalController } from "./ConfigSettingsModal.controller";

const styles = css`
  padding: ${makeSpace(12)};
  border-bottom: ${makeRem(1)} solid ${makeColor("neutral", { opacity: 0.12 })};

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .name {
    display: flex;
    align-items: center;
    gap: ${makeSpace(4)};
    font-weight: ${makeFontWeight("mulish-bold")};
    font-size: ${makeRem(14)};
    color: ${makeColor("neutral-dark")};

    svg {
      color: ${makeColor("neutral", { opacity: 0.5 })};
    }
  }

  .status {
    margin-top: ${makeSpace(4)};
    font-size: ${makeRem(12)};
    color: ${makeColor("neutral", { opacity: 0.5 })};

    &.dirty {
      color: ${makeColor("warning-500")};
    }
  }

  .actions {
    display: flex;
    align-items: center;
    gap: ${makeSpace(8)};
  }
`;

const menuStyles = createDropdownStyles(css`
  display: none;

  &:popover-open {
    display: block;
  }

  border: ${makeRem(1)} solid ${makeColor("neutral", { opacity: 0.12 })};
`);

export function ConfigHeader() {
  const { state } = useConfigurationContext();
  const { saveConfig } = useSaveConfig();

  const { close: closeMenu, triggerRef, menuRef } = useMenu();

  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsDirty(true);
  }, [state]);

  async function handleSave() {
    await saveConfig();
    setIsDirty(false);
    setLastSavedAt(new Date());
  }

  function handleOpenDiff() {
    closeMenu();
    configDiffModalController.launch();
  }

  function handleOpenSettings() {
    closeMenu();
    configSettingsModalController.launch();
  }

  const statusText = isDirty
    ? "Unsaved changes"
    : lastSavedAt
      ? `Saved at ${lastSavedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
      : "No changes yet";

  return (
    <>
      <div className={styles}>
        <div className="row">
          <div className="name">
            <span>{state.settings.prefix}</span>
            <IconArrowDown dxSize={14} />
          </div>
          <div className="actions">
            <Button
              dxColor="primary"
              dxVariant="outlined"
              dxSize="dense"
              DXIconStart={IconFloppyDisk}
              onClick={handleSave}
            >
              Save
            </Button>
            <div>
              <ButtonIcon
                ref={triggerRef}
                dxVariant="icon"
                dxSize="dense"
                DXIcon={IconMoreHorizontal}
                dxHelp="More actions"
              />
              <div ref={menuRef} className={menuStyles}>
                <DropdownMenu>
                  <li>
                    <DropdownMenuItem
                      dxTitle="View Diff"
                      DXIcon={IconInspectCode}
                      onClick={handleOpenDiff}
                    />
                  </li>
                  <li>
                    <DropdownMenuItem
                      dxTitle="Configure"
                      DXIcon={IconSettings05}
                      onClick={handleOpenSettings}
                    />
                  </li>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
        <div className={classes("status", { dirty: isDirty })}>{statusText}</div>
      </div>

      <configDiffModalController.Component />
      <configSettingsModalController.Component />
    </>
  );
}
