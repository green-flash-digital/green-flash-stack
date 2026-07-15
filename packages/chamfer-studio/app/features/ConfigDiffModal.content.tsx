import { css } from "@linaria/core";
import { useModalContext } from "@stratum-ui/react/modal";

import { Button } from "~/components/Button";
import { ModalBody } from "~/components/ModalBody";
import { ModalFooter } from "~/components/ModalFooter";
import { ModalHeader } from "~/components/ModalHeader";

import { ConfigSaveDiff } from "./ConfigSaveDiff";

const diffModalBodyStyles = css`
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
`;

export default function ConfigDiffModalContent() {
  const { closeModal } = useModalContext();

  return (
    <>
      <ModalHeader dxSubtitle="Compare your modified config to the original before saving.">
        View Diff
      </ModalHeader>
      <ModalBody className={diffModalBodyStyles}>
        <ConfigSaveDiff />
      </ModalBody>
      <ModalFooter>
        <Button dxColor="primary" dxSize="big" dxVariant="contained" onClick={closeModal}>
          Close
        </Button>
      </ModalFooter>
    </>
  );
}
