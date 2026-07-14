import { ModalController } from "../../ModalController.js";

export const DefaultDrawerRightController = new ModalController({
  name: "drawer-right",
  props: { variant: "drawer-right" },
  load: async () => import("./Content.js")
});
