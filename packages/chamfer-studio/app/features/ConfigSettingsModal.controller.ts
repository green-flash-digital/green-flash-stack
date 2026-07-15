import { ModalController } from "@stratum-ui/react/modal";

export const configSettingsModalController = new ModalController({
  name: "config-settings",
  props: {
    variant: "modal",
    size: "md"
  },
  load: () => import("./ConfigSettingsModal.content")
});
