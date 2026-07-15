import { Button } from "~/components/Button";
import { IconHelpCircle } from "~/icons/IconHelpCircle";

import { fontVariantPreviewControlsHelpModalController } from "./FontVariantPreviewControlsHelpModal.controller";

export function FontVariantPreviewControlsHelp() {
  return (
    <>
      <Button
        dxVariant="icon"
        DXIcon={IconHelpCircle}
        dxStyle="outlined"
        dxSize="normal"
        onClick={fontVariantPreviewControlsHelpModalController.launch}
        dxHelp="Help"
      />
      <fontVariantPreviewControlsHelpModalController.Component />
    </>
  );
}
