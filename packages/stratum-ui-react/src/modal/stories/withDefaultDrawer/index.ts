import { ModalController } from "../../ModalController.js";

export const DefaultDrawerController = new ModalController({
  name: "drawer-up",
  props: { variant: "drawer-up" },
  load: async () => import("./Content.js")
});
