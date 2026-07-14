import { ModalController } from "../../ModalController.js";
import type { DismissState } from "./Content.js";

export const DismissController = new ModalController<DismissState>({
  name: "with-dismiss",
  load: async () => import("./Content.js")
});
