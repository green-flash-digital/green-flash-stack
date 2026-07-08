import {
  makeSpace,
  makeColor,
  makeFontWeight,
  makeRem,
  makeReset
} from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { useConfigurationContext } from "../Config.context";

const listStyles = css`
  ${makeReset("ul")};
  display: flex;
  flex-direction: column;
`;

const rowStyles = css`
  display: grid;
  grid-template-columns: ${makeRem(200)} 1fr;
  padding: ${makeSpace(24)} 0;
  border-bottom: 1px solid ${makeColor("neutral-light", { opacity: 0.08 })};

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    border-bottom: none;
  }

  .meta {
    padding-right: ${makeSpace(24)};
    border-right: 1px solid ${makeColor("neutral-light", { opacity: 0.08 })};

    h4 {
      margin: 0 0 ${makeSpace(12)} 0;
      font-size: ${makeRem(14)};
      font-weight: ${makeFontWeight("mulish-semiBold")};
      color: ${makeColor("neutral-light", { opacity: 0.9 })};
    }

    dl {
      margin: 0;
      display: grid;
      grid-template-columns: auto 1fr;
      column-gap: ${makeSpace(12)};
      row-gap: ${makeSpace(4)};

      dt {
        font-size: ${makeRem(11)};
        color: ${makeColor("neutral-light", { opacity: 0.4 })};
        font-weight: ${makeFontWeight("mulish-medium")};
        text-transform: uppercase;
        letter-spacing: 0.04em;
        align-self: baseline;
      }

      dd {
        margin: 0;
        font-size: ${makeRem(12)};
        color: ${makeColor("neutral-light", { opacity: 0.65 })};
        font-family: "Consolas", monospace;
        align-self: baseline;
      }
    }
  }

  .specimen {
    padding-left: ${makeSpace(32)};
    display: flex;
    align-items: center;
    overflow: hidden;
    color: ${makeColor("neutral-light", { opacity: 0.9 })};

    p {
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
`;

function toKebab(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function FontVariantPreviewContent() {
  const { state } = useConfigurationContext();

  return (
    <ul className={listStyles}>
      {Object.entries(state.font.variants).map(([variantId, variant]) => {
        const family = Object.values(state.font.families).find(
          (f) => toKebab(f.tokenName) === variant.familyToken
        );
        const fontFamily = family ? `"${family.familyName}"` : undefined;

        return (
          <li key={variantId} className={rowStyles}>
            <div className="meta">
              <h4>{variant.variantName}</h4>
              <dl>
                <dt>Family</dt>
                <dd>{variant.familyToken}</dd>
                <dt>Size</dt>
                <dd>
                  {variant.size}px / {variant.lineHeight} lh
                </dd>
                <dt>Weight</dt>
                <dd>{variant.weight}</dd>
                {variant.letterSpacing !== 0 && (
                  <>
                    <dt>Tracking</dt>
                    <dd>{variant.letterSpacing}px</dd>
                  </>
                )}
              </dl>
            </div>
            <div className="specimen">
              <p
                style={{
                  fontFamily,
                  fontSize: variant.size,
                  fontWeight: variant.weight,
                  lineHeight: variant.lineHeight,
                  letterSpacing: variant.letterSpacing
                }}
              >
                Curious minds discover joy in the beauty of everyday moments
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
