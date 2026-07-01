import { ModalController } from "../../ModalController.js";

export const BasicController = new ModalController({
  load: async () => import("./Content.js")
});
