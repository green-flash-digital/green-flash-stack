import { makeSpace, makeColor, makeRem } from "@keystone@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { Button } from "~/components/Button";
import { InputLabel } from "~/components/InputLabel";
import { InputRadio } from "~/components/InputRadio";
import { InputSection } from "~/components/InputSection";
import { Modal } from "~/components/Modal";
import { ModalBody } from "~/components/ModalBody";
import { ModalHeader } from "~/components/ModalHeader";
import { IconLayout01 } from "~/icons/IconLayout01";
import { IconPaintBoard } from "~/icons/IconPaintBoard";

import { ConfigStyleGuideModal } from "./ConfigStyleGuide.modal";
import { StyleGuideBasic } from "./style-guide/StyleGuideBasic";
import { StyleGuideControlBar } from "./style-guide/StyleGuideControlBar";

const styles = css`
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
`;

const bodyStyles = css`
  display: grid;
  grid-template-columns: auto minmax(min-content, 1fr);
  column-gap: ${makeSpace(32)};
  height: 100%;
  overflow: hidden;
  padding-right: 0;
  border-top: 1px solid ${makeColor("neutral-light", { opacity: 0.1 })};

  .sidebar {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
    background: white;
    min-width: ${makeRem(300)};

    .s-head {
      border-bottom: 1px solid ${makeColor("neutral-light", { opacity: 0.1 })};
      height: ${makeRem(80)};
      display: grid;
      align-items: center;
      justify-content: end;
    }
    .s-body {
      padding: ${makeSpace(16)} 0;
    }
  }

  .guide {
    background: ${makeColor("neutral-light", { opacity: 0.1 })};
    padding: ${makeSpace(32)};
    height: 100%;
    overflow: auto;

    & > div {
      padding: ${makeSpace(32)};
      background: white;
      border-radius: ${makeSpace(8)};
      max-width: ${makeRem(1280)};
      margin: 0 auto;
    }
  }
`;

export function ConfigStyleGuide() {
  return (
    <>
      <Button
        dxVariant="outlined"
        DXIconStart={IconPaintBoard}
        onClick={ConfigStyleGuideModal.open}
      >
        Style Guide
      </Button>
      <Modal
        dxEngine={ConfigStyleGuideModal}
        dxType="default"
        dxLayout="contain"
        dxSize="full"
        className={styles}
      >
        <ModalHeader>Style Guide</ModalHeader>
        <ModalBody className={bodyStyles}>
          <div className="sidebar">
            <div className="s-head">
              <StyleGuideControlBar />
            </div>
            <div className="s-body">
              <InputSection>
                <InputLabel
                  dxLabel="Choose template"
                  dxHelp="Select a layout template to view the guide in different layouts"
                />
                <div>
                  <InputRadio
                    dxVariant="block"
                    DXIcon={IconLayout01}
                    defaultChecked
                    name="layout"
                    value="basic"
                    dxTextPrimary="Basic"
                    dxTextSecondary="A basic layout that displays some sections headers along with it's content"
                  />
                </div>
              </InputSection>
            </div>
          </div>
          <div className="guide">
            <StyleGuideBasic />
          </div>
        </ModalBody>
      </Modal>
    </>
  );
}
