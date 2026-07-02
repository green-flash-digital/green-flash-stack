import { makeSpace, makeColor, makeFontWeight, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import { DiffEditor } from "@monaco-editor/react";

import { useConfigurationContext } from "./Config.context";

const styles = css`
  display: grid;
  grid-template-columns: 1fr 1fr;

  & > div {
    margin-bottom: ${makeSpace(16)};
  }

  .title {
    font-size: ${makeSpace(16)};
    font-weight: ${makeFontWeight("mulish-semiBold")};
    margin-bottom: ${makeSpace(4)};
  }
  .help {
    font-size: ${makeSpace(12)};
    color: ${makeColor("neutral-light", { opacity: 0.8 })};
  }
`;

const diffStyles = css`
  * {
    font-family: unset;
  }
`;

export function ConfigSaveDiff() {
  const { getTokens, originalConfig } = useConfigurationContext();

  return (
    <>
      <div className={styles}>
        <div>
          <div className="title">Original</div>
          <div className="help">This is the original configuration before any edits were made</div>
        </div>
        <div>
          <div className="title">Modified</div>
          <div className="help">
            This configuration reflects the changes you have made in the GUI
          </div>
        </div>
      </div>
      <DiffEditor
        className={diffStyles}
        theme="vs-dark"
        height="100%"
        original={JSON.stringify(originalConfig, null, 2)}
        modified={JSON.stringify(getTokens(), null, 2)}
        language="json"
        options={{
          fontSize: 16
        }}
      />
    </>
  );
}
