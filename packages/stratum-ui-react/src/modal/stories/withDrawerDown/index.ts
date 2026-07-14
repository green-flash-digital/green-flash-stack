import { ModalController } from "../../ModalController.js";

export const DrawerDownController = new ModalController({
  name: "drawer-down",
  props: { variant: "drawer-down" },
  load: async () => import("./Content.js")
});
