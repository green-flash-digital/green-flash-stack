import type { ManualFontStylesValue } from "@keystone-css/core/schemas";
import { manualFontStyles } from "@keystone-css/core/schemas";
import { makeSpace, makeColor, makePx, makeRem, makeReset } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { useConfigurationContext } from "../Config.context";
import { getFontConfigFromState } from "../font/font.utils";
import type { StyleGuideSharedProps } from "./style-guide.utils";
import { StyleGuidePage } from "./StyleGuidePage";
import { StyleGuidePageLeft } from "./StyleGuidePageLeft";
import { StyleGuidePageRight } from "./StyleGuidePageRight";

const styles = css`
  ${makeReset("ul")};
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(32)};

  li {
    padding-bottom: ${makeSpace(32)};
    border-bottom: 1px solid ${makeColor("neutral-light", { opacity: 0.1 })};
  }

  .typ-display {
    margin-bottom: ${makeSpace(24)};
  }
  .typ-description {
    display: flex;
    gap: ${makeSpace(16)};
    span {
      font-family: "Playfair Display";
      &:not(:last-child) {
        padding-right: ${makeSpace(16)};
        border-right: 1px solid ${makeColor("neutral-light", { opacity: 0.5 })};
      }
    }
  }
`;

export function StyleGuideBasicTypography(props: StyleGuideSharedProps) {
  const { font } = useConfigurationContext();
  const fontConfig = getFontConfigFromState(font);
  return (
    <StyleGuidePage>
      <StyleGuidePageLeft dxMarker={props.dxMarker} dxTitle={props.dxTitle}>
        <p>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Magnam, sapiente eaque? Odio
          dolore rem id soluta quas quos blanditiis hic, ea, nam earum cum nulla laboriosam porro
          quo pariatur. Sapiente?
        </p>
      </StyleGuidePageLeft>
      <StyleGuidePageRight>
        <ul className={styles}>
          {Object.entries(font.variants).map(([variantId, variant]) => {
            const fontFamily =
              // @ts-expect-error This is valid but the types don't match up
              fontConfig.families[variant.familyToken].familyName;
            return (
              <li key={variantId}>
                <div
                  className="typ-display"
                  style={{
                    fontFamily: fontFamily ? `"${fontFamily}"` : undefined,
                    fontSize: variant.size,
                    fontWeight: variant.weight.split("-")[1],
                    lineHeight: variant.lineHeight
                  }}
                >
                  <div>{variant.variantName}</div>
                  <div>Curious minds discover joy in the beauty of everyday moments</div>
                </div>
                <div className="typ-description">
                  <span>{variant.familyToken}</span>
                  <span>{fontFamily}</span>
                  <span>{manualFontStyles[variant.weight as keyof ManualFontStylesValue]}</span>
                  <span>{makePx(variant.size)}</span>
                  <span>{variant.lineHeight}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </StyleGuidePageRight>
    </StyleGuidePage>
  );
}
