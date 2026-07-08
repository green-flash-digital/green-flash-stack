import { Button } from "~/components/Button";
import { ButtonGroup } from "~/components/ButtonGroup";
import { IconGrid } from "~/icons/IconGrid";
import { IconGridOff } from "~/icons/IconGridOff";

import { useSizePreviewContext } from "./SizePreview.context";

export function SizePreviewControls() {
  const { setShowGrid, showGrid } = useSizePreviewContext();
  return (
    <ButtonGroup>
      <Button
        dxVariant="icon"
        DXIcon={showGrid ? IconGridOff : IconGrid}
        onClick={() => setShowGrid((prevState) => !prevState)}
        dxStyle="outlined"
        dxSize="normal"
        dxHelp={showGrid ? "Hide grid " : "Show grid"}
      />
    </ButtonGroup>
  );
}
