import type { Meta } from "@storybook/react";

import { Button } from "./Button";
import { Modal } from "./Modal";
import { ModalEngine } from "./Modal.engine";
import { ModalHeader } from "./ModalHeader";

const meta: Meta = {
  title: "Dialog / Modal / Engine"
} satisfies Meta<typeof meta>;

export default meta;

const ModalEngineBasic = new ModalEngine();

export const Basic = () => {
  return (
    <>
      <Button
        dxSize="normal"
        dxColor="secondary"
        dxVariant="contained"
        onClick={ModalEngineBasic.open}
      >
        Open Modal
      </Button>
      <Modal dxEngine={ModalEngineBasic} dxSize="sm">
        <ModalHeader>Modal2 - SM</ModalHeader>
      </Modal>
    </>
  );
};
