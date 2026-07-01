import type { ReactNode } from "react";

import { css } from "@linaria/core";

import { LayoutConfigSectionPreview } from "~/components/LayoutConfigSectionPreview";
import { LayoutConfigSectionPreviewTitle } from "~/components/LayoutConfigSectionPreviewTitle";

import { SpacePreviewProvider } from "./SpacePreview.context";
import { SpacePreviewControls } from "./SpacePreviewControls";

const styles = css`
  background: white;
  .title {
    justify-content: flex-end;
  }
`;

function SpacePreviewContent({ children }: { children: ReactNode }) {
  return (
    <LayoutConfigSectionPreview className={styles}>
      <LayoutConfigSectionPreviewTitle>
        <SpacePreviewControls />
      </LayoutConfigSectionPreviewTitle>
      {children}
    </LayoutConfigSectionPreview>
  );
}

export function SpacePreview({ children }: { children: ReactNode }) {
  return (
    <SpacePreviewProvider>
      <SpacePreviewContent>{children}</SpacePreviewContent>
    </SpacePreviewProvider>
  );
}
