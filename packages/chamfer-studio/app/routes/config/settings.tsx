import type { MetaFunction } from "react-router";

import { LayoutConfig } from "~/components/LayoutConfig";
import { LayoutConfigSection } from "~/components/LayoutConfigSection";
import { LayoutConfigSectionControls } from "~/components/LayoutConfigSectionControls";
import { LayoutConfigSectionControlsContent } from "~/components/LayoutConfigSectionControlsContent";
import { LayoutConfigSectionControlsTitle } from "~/components/LayoutConfigSectionControlsTitle";
import { LayoutPreview } from "~/components/LayoutPreview";
import { LayoutPreviewHeader } from "~/components/LayoutPreviewHeader";
import { LayoutPreviewSection } from "~/components/LayoutPreviewSection";
import { SettingsConfig } from "~/features/settings/SettingsConfig";
import { SettingsPreview } from "~/features/settings/SettingsPreview";
import { SettingsPreviewContent } from "~/features/settings/SettingsPreviewContent";
import { SettingsPreviewControls } from "~/features/settings/SettingsPreviewControls";

export const meta: MetaFunction = () => {
  return [
    { title: "Settings | Chamfer Studio" },
    {
      name: "description",
      content: "Define the specifics of how the utilities can be imported and subsequently used"
    }
  ];
};

export default function ConfigSettingsRoute() {
  return (
    <>
      <LayoutConfig>
        <LayoutConfigSection>
          <LayoutConfigSectionControls>
            <LayoutConfigSectionControlsTitle dxTitle="Settings">
              test
            </LayoutConfigSectionControlsTitle>
            <LayoutConfigSectionControlsContent>
              <SettingsConfig />
            </LayoutConfigSectionControlsContent>
          </LayoutConfigSectionControls>
        </LayoutConfigSection>
      </LayoutConfig>
      <LayoutPreview>
        <SettingsPreview>
          <LayoutPreviewHeader>
            <SettingsPreviewControls />
          </LayoutPreviewHeader>
          <LayoutPreviewSection title="Settings">
            <SettingsPreviewContent />
          </LayoutPreviewSection>
        </SettingsPreview>
      </LayoutPreview>
    </>
  );
}
