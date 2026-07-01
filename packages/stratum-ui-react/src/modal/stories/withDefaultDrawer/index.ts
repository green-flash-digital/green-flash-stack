import { ModalController } from "../../ModalController.js";

export const DefaultDrawerController = new ModalController({
  load: async () => import("./Content.js")
});
