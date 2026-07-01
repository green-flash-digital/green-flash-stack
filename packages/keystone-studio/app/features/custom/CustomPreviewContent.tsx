import { makeSpace, makeColor, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { Table } from "~/components/Table";
import { TableBodyCell } from "~/components/TableBodyCell";
import { TableHead } from "~/components/TableHead";
import { TableHeadCell } from "~/components/TableHeadCell";

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

export function CustomPreviewContent() {
  const { custom } = useConfigurationContext();
  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeadCell>Token Name</TableHeadCell>
          <TableHeadCell>Description</TableHeadCell>
          <TableHeadCell>Type</TableHeadCell>
          <TableHeadCell>Value</TableHeadCell>
        </tr>
      </TableHead>
      <tbody>
        {Object.entries(custom).map(([tokenId, tokenDev]) => (
          <tr key={tokenId}>
            <TableBodyCell>
              <span className={codeStyles}>{tokenDev.name}</span>
            </TableBodyCell>
            <TableBodyCell>{tokenDev.description}</TableBodyCell>
            <TableBodyCell>{tokenDev.type}</TableBodyCell>
            <TableBodyCell>
              <span className={codeStyles}>{tokenDev.value}</span>
            </TableBodyCell>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
