import type { MetaFunction } from "react-router";

import { LayoutConfigSection } from "~/components/LayoutConfigSection";
import { LayoutConfigSectionControls } from "~/components/LayoutConfigSectionControls";
import { LayoutConfigSectionControlsContent } from "~/components/LayoutConfigSectionControlsContent";
import { LayoutConfigSectionControlsTitle } from "~/components/LayoutConfigSectionControlsTitle";
import { FontFamilyConfig } from "~/features/font/FontFamilyConfig";
import { FontFamilyPreview } from "~/features/font/FontFamilyPreview";
import { FontFamilyPreviewContent } from "~/features/font/FontFamilyPreviewContent";
import { FontVariantConfig } from "~/features/font/FontVariantConfig";
import { FontVariantPreview } from "~/features/font/FontVariantPreview";
import { FontVariantPreviewContent } from "~/features/font/FontVariantPreviewContent";

export const meta: MetaFunction = () => {
  return [
    { title: "Typography | Tokens Studio" },
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
      <LayoutConfigSection>
        <LayoutConfigSectionControls>
          <LayoutConfigSectionControlsTitle dxTitle="Families">
            test
          </LayoutConfigSectionControlsTitle>
          <LayoutConfigSectionControlsContent>
            <FontFamilyConfig />
          </LayoutConfigSectionControlsContent>
        </LayoutConfigSectionControls>

        <FontFamilyPreview>
          <FontFamilyPreviewContent />
        </FontFamilyPreview>
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

        <FontVariantPreview>
          <FontVariantPreviewContent />
        </FontVariantPreview>
      </LayoutConfigSection>
    </>
  );
}
