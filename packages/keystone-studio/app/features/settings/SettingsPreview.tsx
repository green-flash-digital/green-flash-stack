import type { ReactNode } from "react";

import { css } from "@linaria/core";

import { LayoutConfigSectionPreview } from "~/components/LayoutConfigSectionPreview";

import { SettingsPreviewProvider } from "./SettingsPreview.context";

const styles = css`
  background: white;
`;

function SettingsPreviewContent({ children }: { children: ReactNode }) {
  return <LayoutConfigSectionPreview className={styles}>{children}</LayoutConfigSectionPreview>;
}

export function SettingsPreview({ children }: { children: ReactNode }) {
  return (
    <SettingsPreviewProvider>
      <SettingsPreviewContent>{children}</SettingsPreviewContent>
    </SettingsPreviewProvider>
  );
}
