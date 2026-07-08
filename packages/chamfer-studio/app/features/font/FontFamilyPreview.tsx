import type { ReactNode } from "react";

import { css } from "@linaria/core";

import { LayoutConfigSectionPreview } from "~/components/LayoutConfigSectionPreview";

import { FontFamilyPreviewProvider } from "./FontFamilyPreview.context";

const styles = css`
  background: white;
`;

function FontFamilyPreviewContent({ children }: { children: ReactNode }) {
  return <LayoutConfigSectionPreview className={styles}>{children}</LayoutConfigSectionPreview>;
}

export function FontFamilyPreview({ children }: { children: ReactNode }) {
  return (
    <FontFamilyPreviewProvider>
      <FontFamilyPreviewContent>{children}</FontFamilyPreviewContent>
    </FontFamilyPreviewProvider>
  );
}
