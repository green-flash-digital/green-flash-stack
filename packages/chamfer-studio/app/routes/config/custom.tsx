import type { MetaFunction } from "react-router";

import { LayoutConfig } from "~/components/LayoutConfig";
import { LayoutConfigSection } from "~/components/LayoutConfigSection";
import { LayoutConfigSectionControls } from "~/components/LayoutConfigSectionControls";
import { LayoutConfigSectionControlsContent } from "~/components/LayoutConfigSectionControlsContent";
import { LayoutConfigSectionControlsTitle } from "~/components/LayoutConfigSectionControlsTitle";
import { LayoutPreview } from "~/components/LayoutPreview";
import { LayoutPreviewHeader } from "~/components/LayoutPreviewHeader";
import { LayoutPreviewSection } from "~/components/LayoutPreviewSection";
import { CustomConfig } from "~/features/custom/CustomConfig";
import { CustomPreview } from "~/features/custom/CustomPreview";
import { CustomPreviewContent } from "~/features/custom/CustomPreviewContent";
import { CustomPreviewControls } from "~/features/custom/CustomPreviewControls";

export const meta: MetaFunction = () => {
  return [
    { title: "Custom | Chamfer Studio" },
    {
      name: "description",
      content:
        "Create custom tokens that can be used all across your application to share various styles and values"
    }
  ];
};

export default function ConfigResponseRoute() {
  return (
    <>
      <LayoutConfig>
        <LayoutConfigSection>
          <LayoutConfigSectionControls>
            <LayoutConfigSectionControlsTitle
              dxTitle="Custom"
              data-description="Brand colors are an essential part of your application's
              design system, providing consistency and harmony across all visual
              elements. This configuration allows you to generate a cohesive
              color palette using harmonious fluorescent tones by defining
              parameters for saturation, brightness, and hue variations."
            >
              test
            </LayoutConfigSectionControlsTitle>
            <LayoutConfigSectionControlsContent>
              <CustomConfig />
            </LayoutConfigSectionControlsContent>
          </LayoutConfigSectionControls>
        </LayoutConfigSection>
      </LayoutConfig>
      <LayoutPreview>
        <CustomPreview>
          <LayoutPreviewHeader>
            <CustomPreviewControls />
          </LayoutPreviewHeader>
          <LayoutPreviewSection title="Custom">
            <CustomPreviewContent />
          </LayoutPreviewSection>
        </CustomPreview>
      </LayoutPreview>
    </>
  );
}
