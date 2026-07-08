import { Button } from "~/components/Button";
import { ButtonGroup } from "~/components/ButtonGroup";
import { IconGrid } from "~/icons/IconGrid";
import { IconGridOff } from "~/icons/IconGridOff";

import { useSpacePreviewContext } from "./SpacePreview.context";

export function SpacePreviewControls() {
  const { setShowMetrics, showMetrics } = useSpacePreviewContext();
  return (
    <ButtonGroup>
      <Button
        dxVariant="icon"
        DXIcon={showMetrics ? IconGridOff : IconGrid}
        onClick={() => setShowMetrics((prevState) => !prevState)}
        dxStyle="outlined"
        dxSize="normal"
        dxHelp={showMetrics ? "Hide metrics " : "Show metrics"}
      />
    </ButtonGroup>
  );
}
