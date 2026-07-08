import { useCallback, useState } from "react";

import { makeSpace, makeColor, makeRem } from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { ButtonIcon } from "~/components/ButtonIcon";
import { Table } from "~/components/Table";
import { TableBodyCell } from "~/components/TableBodyCell";
import { TableHead } from "~/components/TableHead";
import { TableHeadCell } from "~/components/TableHeadCell";
import { IconCopy } from "~/icons/IconCopy";

import { useConfigurationContext } from "../Config.context";

const codeStyles = css`
  font-family: consolas;
  font-size: ${makeRem(14)};
  padding: ${makeRem(2)} ${makeSpace(8)};
  border-radius: ${makeRem(6)};
  background: ${makeColor("neutral-light", { opacity: 0.1 })};
  color: ${makeColor("neutral-light")};
  line-height: ${makeSpace(20)};
  height: ${makeSpace(20)};
  white-space: nowrap;
  display: inline-block;
`;

const copyCell = css`
  display: flex;
  align-items: center;
  gap: ${makeSpace(8)};

  .copied {
    font-size: ${makeRem(12)};
    color: ${makeColor("secondary-400")};
  }
`;

export function CustomPreviewContent() {
  const { state } = useConfigurationContext();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = useCallback(
    (tokenId: string, cssVar: string) => () => {
      navigator.clipboard.writeText(cssVar).then(() => {
        setCopiedId(tokenId);
        setTimeout(() => setCopiedId(null), 1500);
      });
    },
    []
  );

  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeadCell>Token Name</TableHeadCell>
          <TableHeadCell>CSS Variable</TableHeadCell>
          <TableHeadCell>Description</TableHeadCell>
          <TableHeadCell>Type</TableHeadCell>
          <TableHeadCell>Value</TableHeadCell>
        </tr>
      </TableHead>
      <tbody>
        {Object.entries(state.custom).map(([tokenId, tokenDev]) => {
          const cssVar = `--${state.settings.prefix}-${tokenDev.name}`;
          return (
            <tr key={tokenId}>
              <TableBodyCell>
                <span className={codeStyles}>{tokenDev.name}</span>
              </TableBodyCell>
              <TableBodyCell>
                <div className={copyCell}>
                  <span className={codeStyles}>{cssVar}</span>
                  <ButtonIcon
                    dxVariant="icon"
                    dxSize="dense"
                    DXIcon={IconCopy}
                    onClick={handleCopy(tokenId, cssVar)}
                    title="Copy CSS variable"
                  />
                  {copiedId === tokenId && <span className="copied">Copied!</span>}
                </div>
              </TableBodyCell>
              <TableBodyCell>{tokenDev.description}</TableBodyCell>
              <TableBodyCell>{tokenDev.type}</TableBodyCell>
              <TableBodyCell>
                <span className={codeStyles}>{tokenDev.value}</span>
              </TableBodyCell>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
