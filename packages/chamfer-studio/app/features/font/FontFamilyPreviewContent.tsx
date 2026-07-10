import {
  makeSpace,
  makeColor,
  makeFontWeight,
  makeRem,
  makeReset
} from "@chamfer-css/studio-tokens";
import { css } from "@linaria/core";
import { match } from "ts-pattern";

import { InputTextarea } from "~/components/InputTextarea";

import { useConfigurationContext } from "../Config.context";
import { useFontFamilyPreviewContext } from "./FontFamilyPreview.context";

const listStyles = css`
  ${makeReset("ul")};
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(24)};
`;

const familyItemStyles = css`
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(16)};
  padding-bottom: ${makeSpace(24)};
  border-bottom: 1px solid ${makeColor("neutral-light", { opacity: 0.15 })};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const familyHeadingStyles = css`
  display: flex;
  align-items: baseline;
  gap: ${makeSpace(12)};

  h4 {
    margin: 0;
    font-size: ${makeRem(15)};
    font-weight: ${makeFontWeight("mulish-semiBold")};
    color: ${makeColor("neutral-light", { opacity: 0.9 })};
  }

  .meta {
    font-size: ${makeRem(13)};
    color: ${makeColor("neutral-light", { opacity: 0.45 })};
  }
`;

const stylesListStyles = css`
  ${makeReset("ul")};
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(12)};
`;

const styleRowStyles = css`
  display: flex;
  flex-direction: column;
  gap: ${makeSpace(4)};

  .style-label {
    font-size: ${makeRem(11)};
    color: ${makeColor("neutral-light", { opacity: 0.4 })};
    font-weight: ${makeFontWeight("mulish-medium")};
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
`;

export function FontFamilyPreviewContent() {
  const { state } = useConfigurationContext();
  const { fontSize, sampleText, setSampleText, displayCustomTextarea } =
    useFontFamilyPreviewContext();

  return (
    <>
      {displayCustomTextarea && (
        <InputTextarea
          dxSize="dense"
          value={sampleText}
          onChange={({ currentTarget: { value } }) => setSampleText(value)}
        />
      )}
      <ul className={listStyles}>
        {match(state.font)
          .with({ source: "manual" }, (font) =>
            Object.entries(font.families).map(([familyId, family]) => (
              <li key={familyId} className={familyItemStyles}>
                <div className={familyHeadingStyles}>
                  <h4>{family.tokenName}</h4>
                  <span className="meta">
                    {family.familyName} &middot; {Object.keys(family.styles).length}{" "}
                    {Object.keys(family.styles).length === 1 ? "style" : "styles"}
                  </span>
                </div>
                <ul className={stylesListStyles}>
                  {Object.entries(family.styles).map(([styleKey, styleValue]) => {
                    const parts = styleKey.split("-");
                    const fontWeight = parts[1];
                    const isItalic = styleKey.includes("italic");
                    return (
                      <li key={styleKey} className={styleRowStyles}>
                        <span className="style-label">{styleValue.display}</span>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: `"${family.familyName}"`,
                            fontSize,
                            fontWeight,
                            fontStyle: isItalic ? "italic" : "normal",
                            lineHeight: 1.3
                          }}
                        >
                          {sampleText}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )
          .otherwise(() => null)}
      </ul>
    </>
  );
}
