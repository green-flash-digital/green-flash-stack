import type { MetaFunction } from "react-router";

import { LayoutConfigSection } from "~/components/LayoutConfigSection";
import { LayoutConfigSectionControls } from "~/components/LayoutConfigSectionControls";
import { LayoutConfigSectionControlsContent } from "~/components/LayoutConfigSectionControlsContent";
import { LayoutConfigSectionControlsTitle } from "~/components/LayoutConfigSectionControlsTitle";
import { CustomConfig } from "~/features/custom/CustomConfig";
import { CustomPreview } from "~/features/custom/CustomPreview";
import { CustomPreviewContent } from "~/features/custom/CustomPreviewContent";

export const meta: MetaFunction = () => {
  return [
    { title: "Custom | Tokens Studio" },
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
        <CustomPreview>
          <CustomPreviewContent />
        </CustomPreview>
      </LayoutConfigSection>
    </>
  );
}
