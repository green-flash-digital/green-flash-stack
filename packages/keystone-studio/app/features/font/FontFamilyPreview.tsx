import type { ReactNode } from "react";

import { css } from "@linaria/core";

import { LayoutConfigSectionPreview } from "~/components/LayoutConfigSectionPreview";
import { LayoutConfigSectionPreviewTitle } from "~/components/LayoutConfigSectionPreviewTitle";

import { FontFamilyPreviewProvider } from "./FontFamilyPreview.context";
import { FontFamilyPreviewControls } from "./FontFamilyPreviewControls";

const styles = css`
  background: white;

  .title {
    justify-content: flex-end;
  }
`;

function FontFamilyPreviewContent({ children }: { children: ReactNode }) {
  return (
    <LayoutConfigSectionPreview className={styles}>
      <LayoutConfigSectionPreviewTitle>
        <FontFamilyPreviewControls />
      </LayoutConfigSectionPreviewTitle>
      {children}
    </LayoutConfigSectionPreview>
  );
}

export function FontFamilyPreview({ children }: { children: ReactNode }) {
  return (
    <FontFamilyPreviewProvider>
      <FontFamilyPreviewContent>{children}</FontFamilyPreviewContent>
    </FontFamilyPreviewProvider>
  );
}
