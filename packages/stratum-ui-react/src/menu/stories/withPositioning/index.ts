import { css } from "@linaria/core";

import { MenuController } from "../../MenuController.js";

const className = css`
  margin: 0;
`;

export const MenuWithPositioning = new MenuController({
  className,
  position: "top-span-right",
  load: () => import("./content.js"),
});
