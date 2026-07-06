import type { ReactNode } from "react";

import { css } from "@linaria/core";

import { LayoutConfigSectionPreview } from "~/components/LayoutConfigSectionPreview";

import { SpacePreviewProvider } from "./SpacePreview.context";

const styles = css`
  background: white;
`;

function SpacePreviewContent({ children }: { children: ReactNode }) {
  return <LayoutConfigSectionPreview className={styles}>{children}</LayoutConfigSectionPreview>;
}

export function SpacePreview({ children }: { children: ReactNode }) {
  return (
    <SpacePreviewProvider>
      <SpacePreviewContent>{children}</SpacePreviewContent>
    </SpacePreviewProvider>
  );
}
