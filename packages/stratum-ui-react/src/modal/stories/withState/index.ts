import { ModalController } from "../../ModalController.js";
import type { CustomState } from "./Content.js";

export const WithStateController = new ModalController<CustomState>({
  name: "with-state",
  load: async () => import("./Content.js")
});
