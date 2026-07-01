import type { Meta } from "@storybook/react";

import { Button } from "./Button";
import { Modal } from "./Modal";
import { ModalEngine } from "./Modal.engine";
import { ModalHeader } from "./ModalHeader";

const meta: Meta = {
  title: "Dialog / Modal / Variants",
  component: Modal,
  parameters: {
    layout: "centered"
  }
};

export default meta;

const ModalSizeSm = new ModalEngine();
export function SizeSm() {
  return (
    <>
      <Button dxSize="normal" dxColor="secondary" dxVariant="contained" onClick={ModalSizeSm.open}>
        Open Modal
      </Button>
      <Modal dxEngine={ModalSizeSm} dxSize="sm">
        <ModalHeader>Modal - SM</ModalHeader>
      </Modal>
    </>
  );
}

const ModalSizeMd = new ModalEngine();
export function SizeMd() {
  return (
    <>
      <Button dxSize="normal" dxColor="secondary" dxVariant="contained" onClick={ModalSizeMd.open}>
        Open Modal
      </Button>
      <Modal dxEngine={ModalSizeMd} dxSize="md">
        <ModalHeader dxSubtitle="Are your sure you want to delete this?">Modal - MD</ModalHeader>
      </Modal>
    </>
  );
}

const ModalSizeLg = new ModalEngine();
export function SizeLg() {
  return (
    <>
      <Button dxSize="normal" dxColor="secondary" dxVariant="contained" onClick={ModalSizeLg.open}>
        Open Modal
      </Button>
      <Modal dxEngine={ModalSizeLg} dxSize="lg">
        <ModalHeader dxSubtitle="Curabitur blandit tempus porttitor. Maecenas sed diam eget risus varius blandit sit amet non magna.">
          Modal - LG
        </ModalHeader>
      </Modal>
    </>
  );
}

const ModalSizeXl = new ModalEngine();
export function SizeXl() {
  return (
    <>
      <Button dxSize="normal" dxColor="secondary" dxVariant="contained" onClick={ModalSizeXl.open}>
        Open Modal
      </Button>
      <Modal dxEngine={ModalSizeXl} dxSize="xl">
        <ModalHeader dxSubtitle="Curabitur blandit tempus porttitor. Maecenas sed diam eget risus varius blandit sit amet non magna.">
          Modal - XL
        </ModalHeader>
      </Modal>
    </>
  );
}

const ModalSizeFull = new ModalEngine();
export function SizeFull() {
  return (
    <>
      <Button
        dxSize="normal"
        dxColor="secondary"
        dxVariant="contained"
        onClick={ModalSizeFull.open}
      >
        Open Modal
      </Button>
      <Modal dxEngine={ModalSizeFull} dxSize="full">
        <ModalHeader dxSubtitle="This modal is one step shy of a 'total' dialog which would take up the full screen. It's sized at a 100% of the height and width of the screen to ensure that it still appears as a dialog but also has adequate room to do complex things.">
          Modal - Full
        </ModalHeader>
      </Modal>
    </>
  );
}

const DrawerRightToLeft = new ModalEngine();
export function RightToLeft() {
  return (
    <>
      <Button
        dxSize="normal"
        dxColor="secondary"
        dxVariant="contained"
        onClick={DrawerRightToLeft.open}
      >
        ODrawer
      </Button>
      <Modal dxEngine={DrawerRightToLeft} dxType="drawer" dxVariant="right-to-left">
        <ModalHeader>Right to left drawer</ModalHeader>
      </Modal>
    </>
  );
}
