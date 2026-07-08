import type { JSX } from "react";

import { getAccessibleTextColor } from "@keystone-css/core/utils";
import { makeSpace, makeRem } from "@keystone-css/studio-tokens";
import { css } from "@linaria/core";

import { StyleGuideBasicColor } from "./StyleGuideBasicColor";
import { StyleGuideBasicFont } from "./StyleGuideBasicFont";
import { StyleGuideBasicSize } from "./StyleGuideBasicSize";
import { StyleGuideBasicSpacing } from "./StyleGuideBasicSpacing";
import { StyleGuideBasicTypography } from "./StyleGuideBasicTypography";

export function getSGColorClass(colorName: string, ...args: string[]) {
  return `sg-${colorName}${args ? args.join("-") : ""}`;
}
export function getSgColorClassValues(hex: string) {
  return {
    backgroundColor: hex,
    color: getAccessibleTextColor(hex)
  };
}

export const styleGuideTableStyles = css`
  position: relative;
  border: 0;
  padding: 0;
  border-spacing: 0;
  width: 100%;
  isolation: isolate;
  border-collapse: collapse;

  th,
  td {
    margin: 0;
    border: 0;
    padding: 0;
    padding: 0 ${makeSpace(8)};
  }

  th {
    height: ${makeRem(56)};
    font-weight: 700;
    font-family: "Playfair Display";
    font-size: ${makeRem(14)};
    text-transform: uppercase;
    white-space: nowrap;

    &:last-child {
      padding: 0 ${makeSpace(16)};
    }
  }
`;

export type StyleGuideSharedProps = {
  dxTitle: string;
  dxMarker: string;
};

export const styleGuideSections: {
  dxTitle: string;
  dxMarker: string;
  Component: <T extends StyleGuideSharedProps>(props: T) => JSX.Element;
}[] = [
  { dxTitle: "Brand & Neutral Colors", Component: StyleGuideBasicColor },
  { dxTitle: "Font Families", Component: StyleGuideBasicFont },
  { dxTitle: "Typographical Variants", Component: StyleGuideBasicTypography },
  { dxTitle: "Relative Sizing", Component: StyleGuideBasicSize },
  { dxTitle: "Spacing", Component: StyleGuideBasicSpacing }
].map((section, i) => Object.assign(section, { dxMarker: (i + 1).toString().padStart(2, "0") }));
