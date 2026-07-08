import { css } from "@linaria/core";

import { Button } from "~/components/Button";
import { ButtonDropdown } from "~/components/ButtonDropdown";
import { DropdownMenu } from "~/components/DropdownMenu";
import { DropdownMenuItem } from "~/components/DropdownMenuItem";
import { Modal } from "~/components/Modal";
import { useModal } from "~/components/Modal.useModal";
import { ModalBody } from "~/components/ModalBody";
import { ModalFooter } from "~/components/ModalFooter";
import { ModalHeader } from "~/components/ModalHeader";
import { IconFloppyDisk } from "~/icons/IconFloppyDisk";
import { IconInspectCode } from "~/icons/IconInspectCode";
import { IconTimeManagement } from "~/icons/IconTimeManagement";

import { useSaveConfig } from "./config.useSave";
import { ConfigSaveDiff } from "./ConfigSaveDiff";

const modalBodyStyles = css`
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
`;

export function ConfigSave() {
  const modal = useModal();
  const { saveConfig } = useSaveConfig();

  function saveAndClose() {
    saveConfig();
    modal.close();
  }

  return (
    <>
      <ButtonDropdown
        dxVariant="contained"
        DXIconStart={IconFloppyDisk}
        onClick={saveConfig}
        dxLabel="Save"
      >
        <DropdownMenu>
          <li>
            <DropdownMenuItem
              dxTitle="Inspect Changes"
              dxSubtitle="Review a side-by-side comparison of changes"
              DXIcon={IconInspectCode}
              dxTheme="primary"
              onClick={modal.open}
            />
          </li>
          <li>
            <DropdownMenuItem
              dxTitle="Version History"
              dxSubtitle="Compare, review, or revert to earlier versions."
              DXIcon={IconTimeManagement}
              dxTheme="secondary"
              onClick={modal.open}
            />
          </li>
        </DropdownMenu>
      </ButtonDropdown>
      <Modal dxEngine={modal} ref={modal.onMount} dxType="default" dxSize="full">
        <ModalHeader dxSubtitle="View your modified config next to the original & make any changes necessary. Once complete, click the 'save' button at the bottom right hand of the screen.">
          View Diff & Save
        </ModalHeader>
        <ModalBody className={modalBodyStyles}>
          <ConfigSaveDiff />
        </ModalBody>
        <ModalFooter>
          <Button dxColor="primary" dxSize="big" dxVariant="outlined" onClick={modal.close}>
            Cancel
          </Button>
          <Button dxColor="primary" dxSize="big" dxVariant="contained" onClick={saveAndClose}>
            Save
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
