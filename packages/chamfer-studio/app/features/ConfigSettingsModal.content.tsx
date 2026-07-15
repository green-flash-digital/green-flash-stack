import { useModalContext } from "@stratum-ui/react/modal";

import { Button } from "~/components/Button";
import { ModalBody } from "~/components/ModalBody";
import { ModalFooter } from "~/components/ModalFooter";
import { ModalHeader } from "~/components/ModalHeader";
import { SettingsConfig } from "~/features/settings/SettingsConfig";

export default function ConfigSettingsModalContent() {
  const { closeModal } = useModalContext();

  return (
    <>
      <ModalHeader dxSubtitle="Configure the name and runtime behavior of this token set.">
        System Settings
      </ModalHeader>
      <ModalBody>
        <SettingsConfig />
      </ModalBody>
      <ModalFooter>
        <Button dxColor="primary" dxSize="big" dxVariant="contained" onClick={closeModal}>
          Done
        </Button>
      </ModalFooter>
    </>
  );
}
