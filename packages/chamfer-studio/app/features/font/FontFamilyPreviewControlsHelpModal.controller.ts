import { ModalController } from "@stratum-ui/react/modal";

export const fontFamilyPreviewControlsHelpModalController = new ModalController({
  name: "font-family-preview-controls-help",
  props: {
    variant: "drawer-right",
    size: "lg"
  },
  load: () => import("./FontFamilyPreviewControlsHelpModal.content")
});
