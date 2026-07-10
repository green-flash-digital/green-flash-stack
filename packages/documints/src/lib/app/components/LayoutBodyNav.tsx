import {
  makeColor,
  makeCustom,
  makeFontWeight,
  makeRem,
  makeReset,
} from "@buttery/tokens/docs";
import { css } from "@linaria/core";
import type { FC } from "react";
import { NavLink } from "react-router";

import { LayoutBodyNavItem } from "./LayoutBodyNavItem.js";
import { LayoutTextOverline } from "./LayoutTextOverline.js";

import type { ButteryDocsRouteManifestGraphObject } from "../../../utils/util.types.js";

const navStyles = css`
  grid-area: layout-sidebar;
  align-self: start;
  border-right: ${makeRem(1)} solid ${makeColor("neutral-50", { opacity: 0.5 })};
  max-height: ${`calc(100% - ${makeCustom("layout-header-height")})`};
  overflow-y: auto;
  position: sticky;
  top: ${makeCustom("layout-header-height")};
  align-self: start;
`;

const navContentStyles = css`
  position: sticky;
  padding: ${makeRem(32)};
  top: ${makeCustom("layout-header-height")};
  h1 {
    margin: 0;
  }
`;

const sectionStyles = css`
  margin-bottom: ${makeRem(16)};
  & + & {
    padding-top: ${makeRem(16)};
    border-top: ${makeRem(1)} solid ${makeColor("neutral-50", { opacity: 0.5 })};
  }
`;

const anchorOverlineCSS = css`
  ${makeReset("anchor")};

  &.active,
  &:hover {
    & > * {
      font-weight: ${makeFontWeight("Source Sans 3-bold")};
      color: ${makeColor("primary")};
    }
  }
`;

export const LayoutBodyNav: FC<{
  graph: ButteryDocsRouteManifestGraphObject;
}> = ({ graph }) => {
  return (
    <nav className={navStyles}>
      <div className={navContentStyles}>
        {Object.values(graph).map((graphValue) => {
          return Object.entries(graphValue.pages).map(
            ([sectionKey, sectionValues]) => {
              return (
                <section key={sectionKey} className={sectionStyles}>
                  <NavLink
                    to={sectionValues.routePath}
                    className={anchorOverlineCSS}
                  >
                    <LayoutTextOverline>
                      {sectionValues.fileNameFormatted}
                    </LayoutTextOverline>
                  </NavLink>
                  <LayoutBodyNavItem graph={sectionValues.pages} />
                </section>
              );
            }
          );
        })}
      </div>
    </nav>
  );
};
