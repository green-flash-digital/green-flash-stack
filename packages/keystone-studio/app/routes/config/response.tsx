import type { MetaFunction } from "react-router";

import { LayoutConfig } from "~/components/LayoutConfig";
import { LayoutConfigSection } from "~/components/LayoutConfigSection";
import { LayoutConfigSectionControls } from "~/components/LayoutConfigSectionControls";
import { LayoutConfigSectionControlsContent } from "~/components/LayoutConfigSectionControlsContent";
import { LayoutConfigSectionControlsTitle } from "~/components/LayoutConfigSectionControlsTitle";
import { LayoutPreview } from "~/components/LayoutPreview";
import { LayoutPreviewHeader } from "~/components/LayoutPreviewHeader";
import { LayoutPreviewSection } from "~/components/LayoutPreviewSection";
import { BreakpointConfig } from "~/features/response/BreakpointConfig";
import { BreakpointPreview } from "~/features/response/BreakpointPreview";
import { BreakpointPreviewContent } from "~/features/response/BreakpointPreviewContent";
import { BreakpointPreviewControls } from "~/features/response/BreakpointPreviewControls";

export const meta: MetaFunction = () => {
  return [
    { title: "Response | Tokens Studio" },
    {
      name: "description",
      content:
        "Create breakpoint tokens that regulate how the application responds to different viewport sizes"
    }
  ];
};

export default function ConfigResponseRoute() {
  return (
    <>
      <LayoutConfig>
        <LayoutConfigSection>
          <LayoutConfigSectionControls>
            <LayoutConfigSectionControlsTitle dxTitle="Breakpoints" />
            <LayoutConfigSectionControlsContent>
              <BreakpointConfig />
            </LayoutConfigSectionControlsContent>
          </LayoutConfigSectionControls>
        </LayoutConfigSection>
      </LayoutConfig>
      <LayoutPreview>
        <BreakpointPreview>
          <LayoutPreviewHeader>
            <BreakpointPreviewControls />
          </LayoutPreviewHeader>
          <LayoutPreviewSection title="Breakpoints">
            <BreakpointPreviewContent />
          </LayoutPreviewSection>
        </BreakpointPreview>
      </LayoutPreview>
    </>
  );
}
