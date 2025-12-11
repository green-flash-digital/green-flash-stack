import { ModalController } from "../../ModalController.js";

export const ExampleBaseModal = new ModalController({
  load: async () => import("./BaseContent.js"),
});
