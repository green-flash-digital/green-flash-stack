import { MenuController } from "../../MenuController.js";

export const MenuDemoBasic = new MenuController({
  load: () => import("./content.js"),
});
