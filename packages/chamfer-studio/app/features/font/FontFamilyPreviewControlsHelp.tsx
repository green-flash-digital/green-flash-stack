import { Button } from "~/components/Button";
import { IconHelpCircle } from "~/icons/IconHelpCircle";

import { fontFamilyPreviewControlsHelpModalController } from "./FontFamilyPreviewControlsHelpModal.controller";

export function FontFamilyPreviewControlsHelp() {
  return (
    <>
      <Button
        dxVariant="icon"
        DXIcon={IconHelpCircle}
        dxStyle="outlined"
        dxSize="normal"
        onClick={fontFamilyPreviewControlsHelpModalController.launch}
        dxHelp="Help"
      />
      <fontFamilyPreviewControlsHelpModalController.Component />
    </>
  );
}
