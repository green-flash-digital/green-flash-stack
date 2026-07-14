import { ModalController } from "../../ModalController.js";

export const DrawerLeftController = new ModalController({
  name: "drawer-left",
  props: { variant: "drawer-left" },
  load: async () => import("./Content.js")
});
