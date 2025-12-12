import { ModalController } from "../../ModalController.js";
import { CustomState } from "./Content.js";

export const WithStateController = new ModalController<CustomState>({
  load: async () => import("./Content.js"),
});
