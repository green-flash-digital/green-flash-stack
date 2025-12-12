import { ModalController } from "../../ModalController.js";

export const CustomStylesController = new ModalController({
  load: async () => import("./Content.js"),
});
