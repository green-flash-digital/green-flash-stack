import { makeCustom } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { Button } from "~/components/Button";
import { CodeBlock } from "~/components/CodeBlock";
import { Modal } from "~/components/Modal";
import { useModal } from "~/components/Modal.useModal";
import { ModalHeader } from "~/components/ModalHeader";
import { IconCode } from "~/icons/IconCode";

import { useConfigurationContext } from "./Config.context";

const codeStyles = css`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: ${makeCustom("modal-gutters")};
`;

const styles = css`
  && {
    height: 100%;
    display: grid;
    grid-template-rows: auto auto 1fr;
    overflow: hidden;
  }
`;

export function ConfigJSON() {
  const modal = useModal();
  const { getTokens } = useConfigurationContext();
  const config = getTokens();

  return (
    <>
      <Button dxVariant="outlined" DXIconStart={IconCode} onClick={modal.open}>
        JSON
      </Button>
      <Modal
        ref={modal.onMount}
        dxType="drawer"
        dxEngine={modal}
        dxVariant="right"
        dxSize="md"
        className={styles}
      >
        <ModalHeader dxSubtitle="Below you'll find the code representation of the configuration. You can copy and paste this into your `keystone-css.config.json` file or you can use one of the other buttons to save it.">
          Keystone CSS Configuration
        </ModalHeader>
        <CodeBlock
          className={codeStyles}
          dxCode={JSON.stringify(config, null, 2)}
          dxOptions={{ lang: "json" }}
        />
      </Modal>
    </>
  );
}
