import {
  makeSpace,
  makeColor,
  makeFontFamily,
  makePx,
  makeRem,
  makeReset
} from "@chamfer-css/studio-tokens";
import { classes } from "@green-flash/ts-utils/isomorphic";
import { css } from "@linaria/core";

import { useConfigurationContext } from "../Config.context";
import type { StyleGuideSharedProps } from "./style-guide.utils";
import { styleGuideTableStyles } from "./style-guide.utils";
import { StyleGuidePage } from "./StyleGuidePage";
import { StyleGuidePageLeft } from "./StyleGuidePageLeft";
import { StyleGuidePageRight } from "./StyleGuidePageRight";

const styles = css`
  table-layout: auto;

  td {
    text-align: left;
    font-family: ${makeFontFamily("consolas")};
    padding-top: ${makeSpace(16)} !important;
    padding-bottom: ${makeSpace(16)} !important;

    .height {
      display: grid;
      place-content: center;
      position: relative;
      padding-right: ${makeSpace(12)};

      &:after {
        content: "";
        display: block;
        width: 5px;
        right: 0;
        background: ${makeColor("primary", { opacity: 0.5 })};
        height: 100%;
        position: absolute;
      }
    }

    .ex {
      display: flex;
      gap: ${makeSpace(8)};
      font-size: ${makeSpace(12)};

      button {
        ${makeReset("button")};
        padding: 0 1em;
        background: ${makeColor("primary")};
        border-radius: ${makeSpace(4)};
        font-family: ${makeFontFamily("consolas")};
        display: grid;
        place-content: center;
        width: ${makeRem(120)};
      }

      input {
        ${makeReset("input")};
        padding: 0 1em;
        border: 1px solid ${makeColor("primary")};
        font-family: ${makeFontFamily("consolas")};
        border-radius: ${makeSpace(4)};
      }
    }

    .icon {
      display: grid;
      place-content: center;
      font-size: 0.6em;
    }
  }

  th {
    text-align: left;
    &:not(:last-child) {
      width: auto;
      max-width: min-content;
    }
    &:last-child {
      width: 100%;
    }
  }
`;

export function StyleGuideBasicSize(props: StyleGuideSharedProps) {
  const {
    state: {
      sizing: { size }
    }
  } = useConfigurationContext();
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
        <table className={classes(styleGuideTableStyles, styles)}>
          <thead>
            <tr>
              <th>token name</th>
              <th>height</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(size.variants).map(([sizeId, { name, value }]) => {
              const height = makePx(value);

              return (
                <tr key={sizeId}>
                  <td>{name}</td>
                  <td>
                    <div style={{ height }} className="height">
                      {height}
                    </div>
                  </td>
                  <td>
                    <div className="ex">
                      <button type="button" style={{ height }}>
                        {name}
                      </button>
                      <input type="text" style={{ height }} defaultValue={`Input - ${name}`} />
                      <div
                        className="icon"
                        style={{
                          height,
                          aspectRatio: "1 / 1",
                          border: `1px solid ${makeColor("primary")}`
                        }}
                      >
                        i
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </StyleGuidePageRight>
    </StyleGuidePage>
  );
}
