import { makeSpace, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";
import { Fragment } from "react/jsx-runtime";

import { styleGuideSections } from "./style-guide.utils";
import { StyleGuidePage } from "./StyleGuidePage";

const styles = css`
  display: block;
  padding: ${makeSpace(32)};

  h1 {
    font-family: "Playfair Display";
    font-size: ${makeRem(64)};
  }

  .toc {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-rows: auto;
    row-gap: ${makeSpace(16)};
    column-gap: ${makeSpace(16)};

    div {
      font-family: "Playfair Display";
      font-size: ${makeSpace(32)};
      font-weight: 500;

      &.title {
        font-weight: 700;
      }

      &.marker {
        text-align: right;
      }
    }
  }
`;

export function StyleGuideBasicHome() {
  return (
    <StyleGuidePage className={styles}>
      <h1>Style Guide</h1>
      <div className="toc">
        {styleGuideSections.map((section) => (
          <Fragment key={section.dxTitle}>
            <div className="marker">{section.dxMarker}</div>
            <div className="title">{section.dxTitle}</div>
          </Fragment>
        ))}
      </div>
    </StyleGuidePage>
  );
}
