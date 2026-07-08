import type { MetaFunction } from "react-router";

import { LayoutConfig } from "~/components/LayoutConfig";
import { LayoutConfigSection } from "~/components/LayoutConfigSection";
import { LayoutConfigSectionControls } from "~/components/LayoutConfigSectionControls";
import { LayoutConfigSectionControlsContent } from "~/components/LayoutConfigSectionControlsContent";
import { LayoutConfigSectionControlsTitle } from "~/components/LayoutConfigSectionControlsTitle";
import { LayoutPreview } from "~/components/LayoutPreview";
import { LayoutPreviewHeader } from "~/components/LayoutPreviewHeader";
import { LayoutPreviewSection } from "~/components/LayoutPreviewSection";
import { SizeConfig } from "~/features/size-and-space/SizeConfig";
import { SizePreview } from "~/features/size-and-space/SizePreview";
import { SizePreviewContent } from "~/features/size-and-space/SizePreviewContent";
import { SizePreviewControls } from "~/features/size-and-space/SizePreviewControls";
import { SpaceConfig } from "~/features/size-and-space/SpaceConfig";
import { SpacePreview } from "~/features/size-and-space/SpacePreview";
import { SpacePreviewContent } from "~/features/size-and-space/SpacePreviewContent";
import { SpacePreviewControls } from "~/features/size-and-space/SpacePreviewControls";

export const meta: MetaFunction = () => {
  return [
    { title: "Size & Spacing | Tokens Studio" },
    {
      name: "description",
      content:
        "Configure specific tokens to manage vertical rhythm, relative size and factor based spacing"
    }
  ];
};

export default function ConfigSizeAndSpacingRoute() {
  return (
    <>
      <LayoutConfig>
        <LayoutConfigSection>
          <LayoutConfigSectionControls>
            <LayoutConfigSectionControlsTitle dxTitle="Sizing">
              test
            </LayoutConfigSectionControlsTitle>
            <LayoutConfigSectionControlsContent>
              <SizeConfig />
            </LayoutConfigSectionControlsContent>
          </LayoutConfigSectionControls>
        </LayoutConfigSection>
        <LayoutConfigSection>
          <LayoutConfigSectionControls>
            <LayoutConfigSectionControlsTitle dxTitle="Spacing">
              test
            </LayoutConfigSectionControlsTitle>
            <LayoutConfigSectionControlsContent>
              <SpaceConfig />
            </LayoutConfigSectionControlsContent>
          </LayoutConfigSectionControls>
        </LayoutConfigSection>
      </LayoutConfig>
      <LayoutPreview>
        <SizePreview>
          <LayoutPreviewHeader>
            <SizePreviewControls />
          </LayoutPreviewHeader>
          <LayoutPreviewSection title="Sizing">
            <SizePreviewContent />
          </LayoutPreviewSection>
        </SizePreview>
        <SpacePreview>
          <LayoutPreviewHeader>
            <SpacePreviewControls />
          </LayoutPreviewHeader>
          <LayoutPreviewSection title="Spacing">
            <SpacePreviewContent />
          </LayoutPreviewSection>
        </SpacePreview>
      </LayoutPreview>
    </>
  );
}
