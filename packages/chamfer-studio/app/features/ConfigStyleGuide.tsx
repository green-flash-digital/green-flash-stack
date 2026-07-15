import { Button } from "~/components/Button";
import { IconPaintBoard } from "~/icons/IconPaintBoard";

import { configStyleGuideModalController } from "./ConfigStyleGuideModal.controller";

export function ConfigStyleGuide() {
  return (
    <>
      <Button
        dxVariant="outlined"
        DXIconStart={IconPaintBoard}
        onClick={configStyleGuideModalController.launch}
      >
        Style Guide
      </Button>
      <configStyleGuideModalController.Component />
    </>
  );
}
