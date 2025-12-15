import { ModalController } from "../../ModalController.js";

export const DefaultModalController = new ModalController({
  load: async () => import("./Content.js"),
});
