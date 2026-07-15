import { ModalController } from "@stratum-ui/react/modal";

export const configDiffModalController = new ModalController({
  name: "config-diff",
  props: {
    variant: "modal",
    size: "full"
  },
  load: () => import("./ConfigDiffModal.content")
});
