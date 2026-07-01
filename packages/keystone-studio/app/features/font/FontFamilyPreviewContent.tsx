import { manualFontStyles } from "@keystone-css/core/schemas";
import { makeSpace, makeColor, makeRem, makeReset } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import { match } from "ts-pattern";

import { InputTextarea } from "~/components/InputTextarea";

import { useConfigurationContext } from "../Config.context";
import { useFontFamilyPreviewContext } from "./FontFamilyPreview.context";

const styles = css`
  ${makeReset("ul")};
  width: 100%;
  overflow: hidden;

  & > li {
    padding-bottom: ${makeSpace(16)};
    padding-left: ${makeSpace(16)};
    padding-right: ${makeSpace(16)};
    margin-bottom: ${makeSpace(16)};
    border-bottom: 1px solid ${makeColor("neutral-light", { opacity: 0.2 })};
  }

  .heading {
    display: flex;
    align-items: center;
    font-size: ${makeSpace(16)};
    margin: ${makeSpace(20)} 0;

    h4 {
      margin: 0;
    }

    & > * + * {
      margin-left: ${makeSpace(8)};
      padding-left: ${makeSpace(8)};
      border-left: 1px solid ${makeColor("neutral-light", { opacity: 0.5 })};
      color: ${makeColor("neutral-light", { opacity: 0.7 })};
      font-size: ${makeRem(14)};
    }
  }

  p {
    width: 100%;
  }
`;

const styleStyles = css`
  ${makeReset("ul")};
  h5 {
    color: ${makeColor("neutral-light", { opacity: 0.5 })};
    margin-bottom: 0;
  }
`;
export function FontFamilyPreviewContent() {
  const { font } = useConfigurationContext();
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
      <ul className={styles}>
        {match(font)
          .with({ source: "manual" }, (state) =>
            Object.entries(state.families).map(([familyId, family]) => {
              const style = {
                fontFamily: `"${family.familyName}"`,
                fontSize
              };
              return (
                <li key={familyId}>
                  <div className="heading">
                    <h4>{family.tokenName}</h4>
                    <div>
                      {family.familyName}&nbsp;
                      {`(${Object.keys(family.styles).length} Styles)`}
                    </div>
                  </div>
                  <ul className={styleStyles}>
                    {Object.keys(manualFontStyles).map((fontFamilyStyleKey) => {
                      const styleValue = family.styles[fontFamilyStyleKey];
                      if (!styleValue) return;
                      const { display } = styleValue;
                      const [_, fontWeight, fontStyle] = fontFamilyStyleKey.split("-");
                      return (
                        <li key={fontFamilyStyleKey}>
                          <h5>{display}</h5>
                          <p
                            style={{
                              ...style,
                              fontWeight,
                              fontStyle
                            }}
                          >
                            {sampleText}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })
          )
          .otherwise(() => {
            return <div>WIP</div>;
          })}
        {}
      </ul>
    </>
  );
}
