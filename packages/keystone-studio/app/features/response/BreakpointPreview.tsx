import type { ReactNode } from "react";

import { css } from "@linaria/core";

import { LayoutConfigSectionPreview } from "~/components/LayoutConfigSectionPreview";
import { LayoutConfigSectionPreviewTitle } from "~/components/LayoutConfigSectionPreviewTitle";

import { BreakpointPreviewProvider } from "./BreakpointPreview.context";
import { BreakpointPreviewControls } from "./BreakpointPreviewControls";

const styles = css`
  background: white;
  .title {
    justify-content: flex-end;
  }
`;

function BreakpointPreviewContent({ children }: { children: ReactNode }) {
  return (
    <LayoutConfigSectionPreview className={styles}>
      <LayoutConfigSectionPreviewTitle>
        <BreakpointPreviewControls />
      </LayoutConfigSectionPreviewTitle>
      {children}
    </LayoutConfigSectionPreview>
  );
}

export function BreakpointPreview({ children }: { children: ReactNode }) {
  return (
    <BreakpointPreviewProvider>
      <BreakpointPreviewContent>{children}</BreakpointPreviewContent>
    </BreakpointPreviewProvider>
  );
}
