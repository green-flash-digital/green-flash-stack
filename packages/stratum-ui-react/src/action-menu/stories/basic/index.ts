import { ActionMenu } from "../../ActionMenu.js";

export const ActionMenuDemoBasic = new ActionMenu({
  load: () => import("./content.js"),
});
