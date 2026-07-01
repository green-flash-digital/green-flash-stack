import type { ReactNode } from "react";

import { css } from "@linaria/core";

import { LayoutConfigSectionPreview } from "~/components/LayoutConfigSectionPreview";
import { LayoutConfigSectionPreviewTitle } from "~/components/LayoutConfigSectionPreviewTitle";

import { FontVariantPreviewProvider } from "./FontVariantPreview.context";
import { FontVariantPreviewControls } from "./FontVariantPreviewControls";

const styles = css`
  background: white;

  .title {
    justify-content: flex-end;
  }
`;

function FontVariantPreviewContent({ children }: { children: ReactNode }) {
  return (
    <LayoutConfigSectionPreview className={styles}>
      <LayoutConfigSectionPreviewTitle>
        <FontVariantPreviewControls />
      </LayoutConfigSectionPreviewTitle>
      {children}
    </LayoutConfigSectionPreview>
  );
}

export function FontVariantPreview({ children }: { children: ReactNode }) {
  return (
    <FontVariantPreviewProvider>
      <FontVariantPreviewContent>{children}</FontVariantPreviewContent>
    </FontVariantPreviewProvider>
  );
}
