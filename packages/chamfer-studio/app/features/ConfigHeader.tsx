import { useEffect, useRef, useState } from "react";
import { useDropdownMenu } from "react-hook-primitives";

import { makeSpace, makeColor, makeFontWeight, makeRem } from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

import { Button } from "~/components/Button";
import { ButtonIcon } from "~/components/ButtonIcon";
import { DropdownMenu } from "~/components/DropdownMenu";
import { DropdownMenuItem } from "~/components/DropdownMenuItem";
import { Modal } from "~/components/Modal";
import { useModal } from "~/components/Modal.useModal";
import { ModalBody } from "~/components/ModalBody";
import { ModalFooter } from "~/components/ModalFooter";
import { ModalHeader } from "~/components/ModalHeader";
import { createDropdownStyles } from "~/components/shared-styles";
import { SettingsConfig } from "~/features/settings/SettingsConfig";
import { IconArrowDown } from "~/icons/IconArrowDown";
import { IconFloppyDisk } from "~/icons/IconFloppyDisk";
import { IconInspectCode } from "~/icons/IconInspectCode";
import { IconMoreHorizontal } from "~/icons/IconMoreHorizontal";
import { IconSettings05 } from "~/icons/IconSettings05";

import { useConfigurationContext } from "./Config.context";
import { useSaveConfig } from "./config.useSave";
import { ConfigSaveDiff } from "./ConfigSaveDiff";

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

const diffModalBodyStyles = css`
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
`;

export function ConfigHeader() {
  const { state } = useConfigurationContext();
  const { saveConfig } = useSaveConfig();
  const diffModal = useModal();
  const settingsModal = useModal();

  const { closeMenu, setTargetRef, setDropdownRef, alignmentRef } = useDropdownMenu<
    HTMLDivElement,
    HTMLDivElement
  >({
    dxOffset: 4,
    dxPosition: "bottom-right"
  });

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
    diffModal.open();
  }

  function handleOpenSettings() {
    closeMenu();
    settingsModal.open();
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
            <div ref={alignmentRef}>
              <ButtonIcon
                ref={setTargetRef}
                dxVariant="icon"
                dxSize="dense"
                DXIcon={IconMoreHorizontal}
                dxHelp="More actions"
              />
              <div ref={setDropdownRef} className={menuStyles}>
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

      <Modal dxEngine={diffModal} ref={diffModal.onMount} dxType="default" dxSize="full">
        <ModalHeader dxSubtitle="Compare your modified config to the original before saving.">
          View Diff
        </ModalHeader>
        <ModalBody className={diffModalBodyStyles}>
          <ConfigSaveDiff />
        </ModalBody>
        <ModalFooter>
          <Button dxColor="primary" dxSize="big" dxVariant="contained" onClick={diffModal.close}>
            Close
          </Button>
        </ModalFooter>
      </Modal>

      <Modal dxEngine={settingsModal} ref={settingsModal.onMount} dxType="default" dxSize="md">
        <ModalHeader dxSubtitle="Configure the name and runtime behavior of this token set.">
          System Settings
        </ModalHeader>
        <ModalBody>
          <SettingsConfig />
        </ModalBody>
        <ModalFooter>
          <Button
            dxColor="primary"
            dxSize="big"
            dxVariant="contained"
            onClick={settingsModal.close}
          >
            Done
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
