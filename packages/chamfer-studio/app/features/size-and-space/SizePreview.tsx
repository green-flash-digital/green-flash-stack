import type { ReactNode } from "react";

import { css } from "@linaria/core";

import { LayoutConfigSectionPreview } from "~/components/LayoutConfigSectionPreview";

import { SizePreviewProvider } from "./SizePreview.context";

const styles = css`
  background: white;
`;

function SizePreviewContent({ children }: { children: ReactNode }) {
  return <LayoutConfigSectionPreview className={styles}>{children}</LayoutConfigSectionPreview>;
}

export function SizePreview({ children }: { children: ReactNode }) {
  return (
    <SizePreviewProvider>
      <SizePreviewContent>{children}</SizePreviewContent>
    </SizePreviewProvider>
  );
}
