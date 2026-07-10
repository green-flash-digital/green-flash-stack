import type { ReactNode } from "react";

import { css } from "@linaria/core";

import { LayoutConfigSectionPreview } from "~/components/LayoutConfigSectionPreview";

import { CustomPreviewProvider } from "./CustomPreview.context";

const styles = css`
  background: white;
`;

function CustomPreviewContent({ children }: { children: ReactNode }) {
  return <LayoutConfigSectionPreview className={styles}>{children}</LayoutConfigSectionPreview>;
}

export function CustomPreview({ children }: { children: ReactNode }) {
  return (
    <CustomPreviewProvider>
      <CustomPreviewContent>{children}</CustomPreviewContent>
    </CustomPreviewProvider>
  );
}
