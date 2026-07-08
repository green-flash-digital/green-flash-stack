import type { MetaFunction } from "react-router";

import { LayoutConfig } from "~/components/LayoutConfig";
import { LayoutConfigSection } from "~/components/LayoutConfigSection";
import { LayoutConfigSectionControls } from "~/components/LayoutConfigSectionControls";
import { LayoutConfigSectionControlsContent } from "~/components/LayoutConfigSectionControlsContent";
import { LayoutConfigSectionControlsTitle } from "~/components/LayoutConfigSectionControlsTitle";
import { LayoutPreview } from "~/components/LayoutPreview";
import { LayoutPreviewHeader } from "~/components/LayoutPreviewHeader";
import { LayoutPreviewSection } from "~/components/LayoutPreviewSection";
import { FontFamilyConfig } from "~/features/font/FontFamilyConfig";
import { FontFamilyPreview } from "~/features/font/FontFamilyPreview";
import { FontFamilyPreviewContent } from "~/features/font/FontFamilyPreviewContent";
import { FontFamilyPreviewControls } from "~/features/font/FontFamilyPreviewControls";
import { FontVariantConfig } from "~/features/font/FontVariantConfig";
import { FontVariantPreview } from "~/features/font/FontVariantPreview";
import { FontVariantPreviewContent } from "~/features/font/FontVariantPreviewContent";
import { FontVariantPreviewControls } from "~/features/font/FontVariantPreviewControls";

export const meta: MetaFunction = () => {
  return [
    { title: "Typography | Chamfer Studio" },
    {
      name: "description",
      content:
        "Select font families & weights to then configure specific typographical variant tokens that can easily be re-used"
    }
  ];
};

export default function ConfigTypographyRoute() {
  return (
    <>
      <LayoutConfig>
        <LayoutConfigSection>
          <LayoutConfigSectionControls>
            <LayoutConfigSectionControlsTitle dxTitle="Families">
              test
            </LayoutConfigSectionControlsTitle>
            <LayoutConfigSectionControlsContent>
              <FontFamilyConfig />
            </LayoutConfigSectionControlsContent>
          </LayoutConfigSectionControls>
        </LayoutConfigSection>
        <LayoutConfigSection>
          <LayoutConfigSectionControls>
            <LayoutConfigSectionControlsTitle dxTitle="Typography variants">
              test
            </LayoutConfigSectionControlsTitle>
            <LayoutConfigSectionControlsContent>
              <FontVariantConfig />
            </LayoutConfigSectionControlsContent>
          </LayoutConfigSectionControls>
        </LayoutConfigSection>
      </LayoutConfig>
      <LayoutPreview>
        <FontFamilyPreview>
          <LayoutPreviewHeader>
            <FontFamilyPreviewControls />
          </LayoutPreviewHeader>
          <LayoutPreviewSection title="Families">
            <FontFamilyPreviewContent />
          </LayoutPreviewSection>
        </FontFamilyPreview>
        <FontVariantPreview>
          <LayoutPreviewHeader>
            <FontVariantPreviewControls />
          </LayoutPreviewHeader>
          <LayoutPreviewSection title="Typography variants">
            <FontVariantPreviewContent />
          </LayoutPreviewSection>
        </FontVariantPreview>
      </LayoutPreview>
    </>
  );
}
