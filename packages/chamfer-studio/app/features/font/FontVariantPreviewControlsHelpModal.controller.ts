import { ModalController } from "@stratum-ui/react/modal";

export const fontVariantPreviewControlsHelpModalController = new ModalController({
  name: "font-variant-preview-controls-help",
  props: {
    variant: "drawer-right",
    size: "lg"
  },
  load: () => import("./FontVariantPreviewControlsHelpModal.content")
});
