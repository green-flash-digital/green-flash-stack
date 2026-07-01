import { ModalController } from "../../ModalController.js";
import type { CustomState } from "./Content.js";

export const WithStateController = new ModalController<CustomState>({
  load: async () => import("./Content.js")
});
