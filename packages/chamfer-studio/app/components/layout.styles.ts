import { css } from "@linaria/core";

import { makeRem } from "../../../chamfer-studio-tokens/.chamfer/_generated/makeUtils";

export const layoutSidebarStyles = css`
  border-right: 1px solid #ededed;
`;

export const layoutSidebarSectionStyles = css`
  padding: 0 ${makeRem(8)};
`;
