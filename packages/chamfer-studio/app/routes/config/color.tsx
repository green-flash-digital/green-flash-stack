import type { MetaFunction } from "react-router";

import { LayoutConfig } from "~/components/LayoutConfig";
import { LayoutConfigSection } from "~/components/LayoutConfigSection";
import { LayoutConfigSectionControls } from "~/components/LayoutConfigSectionControls";
import { LayoutConfigSectionControlsContent } from "~/components/LayoutConfigSectionControlsContent";
import { LayoutConfigSectionControlsTitle } from "~/components/LayoutConfigSectionControlsTitle";
import { LayoutPreview } from "~/components/LayoutPreview";
import { LayoutPreviewHeader } from "~/components/LayoutPreviewHeader";
import { LayoutPreviewSection } from "~/components/LayoutPreviewSection";
import { ColorBrandMode } from "~/features/color/ColorBrandMode";
import { ColorNeutral } from "~/features/color/ColorNeutral";
import { ColorPreview } from "~/features/color/ColorPreview";
import { ColorPreviewControls } from "~/features/color/ColorPreviewControls";
import { ColorPreviewPalette } from "~/features/color/ColorPreviewPalette";
import { ColorSemanticRoles } from "~/features/color/ColorSemanticRoles";
import { SemanticPreviewContent } from "~/features/color/SemanticPreviewContent";

export const meta: MetaFunction = () => {
  return [
    { title: "Color | Chamfer Studio" },
    {
      name: "description",
      content:
        "Select a methodology in which to create the colors in your palette. Add variants, neutral tones, and static colors to round your palette out."
    }
  ];
};

export default function ColorsRoute() {
  return (
    <>
      <LayoutConfig>
        <LayoutConfigSection>
          <LayoutConfigSectionControls>
            <LayoutConfigSectionControlsTitle dxTitle="Brand Colors" />
            <LayoutConfigSectionControlsContent>
              <ColorBrandMode />
            </LayoutConfigSectionControlsContent>
          </LayoutConfigSectionControls>
        </LayoutConfigSection>
        <LayoutConfigSection>
          <LayoutConfigSectionControls>
            <LayoutConfigSectionControlsTitle
              dxTitle="Neutral Colors"
              data-description="Brand colors are an essential part of your application's
              design system, providing consistency and harmony across all visual
              elements. This configuration allows you to generate a cohesive
              color palette using harmonious fluorescent tones by defining
              parameters for saturation, brightness, and hue variations."
            >
              test
            </LayoutConfigSectionControlsTitle>
            <LayoutConfigSectionControlsContent>
              <ColorNeutral />
            </LayoutConfigSectionControlsContent>
          </LayoutConfigSectionControls>
        </LayoutConfigSection>
        <LayoutConfigSection>
          <LayoutConfigSectionControls>
            <LayoutConfigSectionControlsTitle dxTitle="Semantic Roles" />
            <LayoutConfigSectionControlsContent>
              <ColorSemanticRoles />
            </LayoutConfigSectionControlsContent>
          </LayoutConfigSectionControls>
        </LayoutConfigSection>
      </LayoutConfig>
      <LayoutPreview>
        <ColorPreview>
          <LayoutPreviewHeader>
            <ColorPreviewControls />
          </LayoutPreviewHeader>
          <LayoutPreviewSection title="Brand & neutral colors">
            <ColorPreviewPalette />
          </LayoutPreviewSection>
          <LayoutPreviewSection title="Semantic roles">
            <SemanticPreviewContent />
          </LayoutPreviewSection>
        </ColorPreview>
      </LayoutPreview>
    </>
  );
}
