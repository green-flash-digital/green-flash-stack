import { css } from "@linaria/core";

import { makeRem } from "../../../keystone-studio-tokens/.keystone/_generated/makeUtils";

export const layoutSidebarStyles = css`
  border-right: 1px solid #ededed;
`;

export const layoutSidebarSectionStyles = css`
  padding: 0 ${makeRem(8)};
`;
