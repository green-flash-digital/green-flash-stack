import type { ReactNode } from "react";

import { css } from "@linaria/core";

import { LayoutConfigSectionPreview } from "~/components/LayoutConfigSectionPreview";
import { LayoutConfigSectionPreviewTitle } from "~/components/LayoutConfigSectionPreviewTitle";

import { CustomPreviewProvider } from "./CustomPreview.context";
import { CustomPreviewControls } from "./CustomPreviewControls";

const styles = css`
  background: white;
  .title {
    justify-content: flex-end;
  }
`;

function CustomPreviewContent({ children }: { children: ReactNode }) {
  return (
    <LayoutConfigSectionPreview className={styles}>
      <LayoutConfigSectionPreviewTitle>
        <CustomPreviewControls />
      </LayoutConfigSectionPreviewTitle>
      {children}
    </LayoutConfigSectionPreview>
  );
}

export function CustomPreview({ children }: { children: ReactNode }) {
  return (
    <CustomPreviewProvider>
      <CustomPreviewContent>{children}</CustomPreviewContent>
    </CustomPreviewProvider>
  );
}
