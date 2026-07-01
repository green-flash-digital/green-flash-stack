import type { ReactNode } from "react";

import { css } from "@linaria/core";

import { LayoutConfigSectionPreview } from "~/components/LayoutConfigSectionPreview";
import { LayoutConfigSectionPreviewTitle } from "~/components/LayoutConfigSectionPreviewTitle";

import { SettingsPreviewProvider } from "./SettingsPreview.context";
import { SettingsPreviewControls } from "./SettingsPreviewControls";

const styles = css`
  background: white;
  .title {
    justify-content: flex-end;
    z-index: 10;
  }
`;

function SettingsPreviewContent({ children }: { children: ReactNode }) {
  return (
    <LayoutConfigSectionPreview className={styles}>
      <LayoutConfigSectionPreviewTitle>
        <SettingsPreviewControls />
      </LayoutConfigSectionPreviewTitle>
      {children}
    </LayoutConfigSectionPreview>
  );
}

export function SettingsPreview({ children }: { children: ReactNode }) {
  return (
    <SettingsPreviewProvider>
      <SettingsPreviewContent>{children}</SettingsPreviewContent>
    </SettingsPreviewProvider>
  );
}
