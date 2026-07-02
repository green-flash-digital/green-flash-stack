import { makeSpace, makeColor, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { useConfigurationContext } from "../Config.context";
import type { StyleGuideSharedProps } from "./style-guide.utils";
import { StyleGuidePage } from "./StyleGuidePage";
import { StyleGuidePageLeft } from "./StyleGuidePageLeft";
import { StyleGuidePageRight } from "./StyleGuidePageRight";

const styles = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto;

  .family {
    padding: ${makeSpace(32)};
    border: 1px solid ${makeColor("neutral-light", { opacity: 0.03 })};
    font-family: var(--family);
    background: var(--bg);

    .overline {
      font-size: ${makeRem(14)};
      font-family: "Playfair Display";
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: ${makeSpace(32)};
    }

    .title {
      font-size: ${makeRem(48)};
      font-family: var(--family);
    }
    .alph {
      font-size: ${makeRem(18)};
      font-family: var(--family);
    }
    .a {
      font-size: ${makeRem(100)};
      font-family: var(--family);
    }
  }
`;

function getRandomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function StyleGuideBasicFont(props: StyleGuideSharedProps) {
  const { font } = useConfigurationContext();
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
        <div className={styles}>
          {Object.entries(font.families).map(([familyId, familyDef]) => (
            <div
              key={familyId}
              className="family"
              style={{
                // @ts-expect-error Custom properties are valid
                "--family": familyDef.name,
                "--bg": makeColor("neutral-light", {
                  opacity: getRandomNumber(0, 0.03)
                })
              }}
            >
              <div className="overline">{familyDef.tokenName}</div>
              <div className="title">{familyDef.familyName}</div>
              <div className="alph">ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
              <div className="alph">abcdefghijklmnopqrstuvwxyz</div>
              <div className="alph">123456789!@#$%^&*()</div>
              <div className="a">Aa</div>
            </div>
          ))}
        </div>
      </StyleGuidePageRight>
    </StyleGuidePage>
  );
}
