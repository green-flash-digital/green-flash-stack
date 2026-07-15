import { makeCustom } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { CodeBlock } from "~/components/CodeBlock";
import { ModalHeader } from "~/components/ModalHeader";

import { useConfigurationContext } from "./Config.context";

const codeStyles = css`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding: ${makeCustom("modal-gutters")};
`;

export default function ConfigJSONModalContent() {
  const { getTokens } = useConfigurationContext();
  const config = getTokens();

  return (
    <>
      <ModalHeader dxSubtitle="Below you'll find the code representation of the configuration. You can copy and paste this into your `chamfer-css.config.json` file or you can use one of the other buttons to save it.">
        Chamfer CSS Configuration
      </ModalHeader>
      <CodeBlock
        className={codeStyles}
        dxCode={JSON.stringify(config, null, 2)}
        dxOptions={{ lang: "json" }}
      />
    </>
  );
}
