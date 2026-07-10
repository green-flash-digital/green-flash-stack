import type { ReactNode } from "react";

import { css } from "@linaria/core";

import { LayoutConfigSectionPreview } from "~/components/LayoutConfigSectionPreview";

import { FontVariantPreviewProvider } from "./FontVariantPreview.context";

const styles = css`
  background: white;
`;

function FontVariantPreviewContent({ children }: { children: ReactNode }) {
  return <LayoutConfigSectionPreview className={styles}>{children}</LayoutConfigSectionPreview>;
}

export function FontVariantPreview({ children }: { children: ReactNode }) {
  return (
    <FontVariantPreviewProvider>
      <FontVariantPreviewContent>{children}</FontVariantPreviewContent>
    </FontVariantPreviewProvider>
  );
}
