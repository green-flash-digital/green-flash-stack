import { ModalController } from "../../ModalController.js";

export const BasicController = new ModalController({
  name: "with-basic",
  load: async () => import("./Content.js")
});
