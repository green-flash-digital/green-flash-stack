import type { MetaFunction } from "react-router";

import { LayoutConfigSection } from "~/components/LayoutConfigSection";
import { LayoutConfigSectionControls } from "~/components/LayoutConfigSectionControls";
import { LayoutConfigSectionControlsContent } from "~/components/LayoutConfigSectionControlsContent";
import { LayoutConfigSectionControlsTitle } from "~/components/LayoutConfigSectionControlsTitle";
import { BreakpointConfig } from "~/features/response/BreakpointConfig";
import { BreakpointPreview } from "~/features/response/BreakpointPreview";
import { BreakpointPreviewContent } from "~/features/response/BreakpointPreviewContent";

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
      <LayoutConfigSection>
        <LayoutConfigSectionControls>
          <LayoutConfigSectionControlsTitle dxTitle="Breakpoints" />
          <LayoutConfigSectionControlsContent>
            <BreakpointConfig />
          </LayoutConfigSectionControlsContent>
        </LayoutConfigSectionControls>
        <BreakpointPreview>
          <BreakpointPreviewContent />
        </BreakpointPreview>
      </LayoutConfigSection>
    </>
  );
}
