import type { CustomState } from "./Content.js";

import { ModalController } from "../../ModalController.js";

export const WithStateController = new ModalController<CustomState>({
  load: async () => import("./Content.js"),
});
