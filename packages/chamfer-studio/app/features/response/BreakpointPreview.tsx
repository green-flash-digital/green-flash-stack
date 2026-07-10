import type { ReactNode } from "react";

import { css } from "@linaria/core";

import { LayoutConfigSectionPreview } from "~/components/LayoutConfigSectionPreview";

import { BreakpointPreviewProvider } from "./BreakpointPreview.context";

const styles = css`
  background: white;
`;

function BreakpointPreviewContent({ children }: { children: ReactNode }) {
  return <LayoutConfigSectionPreview className={styles}>{children}</LayoutConfigSectionPreview>;
}

export function BreakpointPreview({ children }: { children: ReactNode }) {
  return (
    <BreakpointPreviewProvider>
      <BreakpointPreviewContent>{children}</BreakpointPreviewContent>
    </BreakpointPreviewProvider>
  );
}
