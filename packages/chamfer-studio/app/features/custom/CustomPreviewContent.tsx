import { useCallback, useState } from "react";

import {
  makeSpace,
  makeColor,
  makeFontWeight,
  makeRem,
  makeReset
} from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";

import { ButtonIcon } from "~/components/ButtonIcon";
import { IconCopy } from "~/icons/IconCopy";

import { useConfigurationContext } from "../Config.context";

const codeStyles = css`
  font-family: consolas;
  font-size: ${makeRem(13)};
  padding: ${makeRem(2)} ${makeSpace(8)};
  border-radius: ${makeRem(6)};
  background: ${makeColor("neutral", { opacity: 0.08 })};
  color: ${makeColor("neutral-dark")};
  line-height: ${makeSpace(20)};
  height: ${makeSpace(20)};
  white-space: nowrap;
  display: inline-block;
`;

const listStyles = css`
  ${makeReset("ul")};
  display: flex;
  flex-direction: column;
`;

const rowStyles = css`
  display: grid;
  grid-template-columns: ${makeRem(200)} 1fr;
  padding: ${makeSpace(24)} 0;
  border-bottom: 1px solid ${makeColor("neutral", { opacity: 0.08 })};

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    border-bottom: none;
  }

  .meta {
    padding-right: ${makeSpace(24)};
    border-right: 1px solid ${makeColor("neutral", { opacity: 0.08 })};

    h4 {
      margin: 0 0 ${makeSpace(8)} 0;
      font-size: ${makeRem(14)};
      font-weight: ${makeFontWeight("mulish-semiBold")};
      color: ${makeColor("neutral-dark")};
    }

    p {
      margin: 0;
      font-size: ${makeRem(13)};
      color: ${makeColor("neutral", { opacity: 0.6 })};
    }
  }

  .details {
    padding-left: ${makeSpace(32)};

    dl {
      margin: 0;
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      column-gap: ${makeSpace(12)};
      row-gap: ${makeSpace(12)};

      dt {
        font-size: ${makeRem(11)};
        color: ${makeColor("neutral", { opacity: 0.5 })};
        font-weight: ${makeFontWeight("mulish-medium")};
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      dd {
        margin: 0;
      }
    }
  }
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
    <ul className={listStyles}>
      {Object.entries(state.custom).map(([tokenId, tokenDef]) => {
        const cssVar = `--${state.settings.prefix}-${tokenDef.name}`;
        return (
          <li key={tokenId} className={rowStyles}>
            <div className="meta">
              <h4>{tokenDef.name}</h4>
              {tokenDef.description && <p>{tokenDef.description}</p>}
            </div>
            <div className="details">
              <dl>
                <dt>CSS Variable</dt>
                <dd>
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
                </dd>
                <dt>Type</dt>
                <dd>{tokenDef.type}</dd>
                <dt>Value</dt>
                <dd>
                  <span className={codeStyles}>{tokenDef.value}</span>
                </dd>
              </dl>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
