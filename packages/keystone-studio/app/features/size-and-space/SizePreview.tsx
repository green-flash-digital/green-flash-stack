import type { ReactNode } from "react";

import { css } from "@linaria/core";

import { LayoutConfigSectionPreview } from "~/components/LayoutConfigSectionPreview";
import { LayoutConfigSectionPreviewTitle } from "~/components/LayoutConfigSectionPreviewTitle";

import { SizePreviewProvider } from "./SizePreview.context";
import { SizePreviewControls } from "./SizePreviewControls";

const styles = css`
  background: white;

  .title {
    justify-content: flex-end;
  }
`;

function SizePreviewContent({ children }: { children: ReactNode }) {
  return (
    <LayoutConfigSectionPreview className={styles}>
      <LayoutConfigSectionPreviewTitle>
        <SizePreviewControls />
      </LayoutConfigSectionPreviewTitle>
      {children}
    </LayoutConfigSectionPreview>
  );
}

export function SizePreview({ children }: { children: ReactNode }) {
  return (
    <SizePreviewProvider>
      <SizePreviewContent>{children}</SizePreviewContent>
    </SizePreviewProvider>
  );
}
