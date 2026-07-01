import type { ManualFontStylesValue } from "@keystone-css/core/schemas";
import { manualFontStyles } from "@keystone-css/core/schemas";
import {
  makeSpace,
  makeColor,
  makeFontWeight,
  makeRem,
  makeReset
} from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { useConfigurationContext } from "../Config.context";
import { getFontConfigFromState } from "./font.utils";

const styles = css`
  ${makeReset("ul")};
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(16)};

  li {
    display: grid;
    grid-template-columns: ${makeRem(232)} 60%;

    padding: ${makeSpace(32)} 0;

    &:first-of-type {
      padding-top: 0;
    }

    &:not(:first-of-type) {
      border-top: 1px solid ${makeColor("neutral-light", { opacity: 0.1 })};
    }

    .heading {
      padding-right: ${makeSpace(16)};
      border-right: 1px solid ${makeColor("neutral-light", { opacity: 0.1 })};
      margin-right: ${makeSpace(32)};

      h4 {
        margin: 0;
      }

      .sub {
        font-size: ${makeRem(14)};
        display: grid;
        grid-template-columns: auto 1fr;
        column-gap: ${makeSpace(16)};
        font-weight: ${makeFontWeight("mulish-light")};
        line-height: 1.3;
        dd {
          margin: 0;
        }
      }
    }
  }
`;

export function FontVariantPreviewContent() {
  const { font } = useConfigurationContext();

  const fontConfig = getFontConfigFromState(font);

  return (
    <ul className={styles}>
      {Object.entries(font.variants).map(([variantId, variant]) => {
        const fontFamily = fontConfig.families[variant.familyToken]?.family;
        return (
          <li key={variantId}>
            <div className="heading">
              <h4>{variant.variantName}</h4>
              <dl className="sub">
                <dt>Family</dt>
                <dd>{variant.familyToken}</dd>
                <dt>Size</dt>
                <dd>
                  {variant.size}px / {variant.lineHeight}
                </dd>
                <dt>Weight</dt>
                <dd>{manualFontStyles[variant.weight as keyof ManualFontStylesValue]}</dd>
              </dl>
            </div>
            <div
              style={{
                fontFamily: `"${fontFamily}"`,
                fontSize: variant.size,
                fontWeight: variant.weight.split("-")[1],
                lineHeight: variant.lineHeight
              }}
            >
              Curious minds discover joy in the beauty of everyday moments
            </div>
          </li>
        );
      })}
    </ul>
  );
}
