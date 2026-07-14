import { css } from "@linaria/core";

import { ModalController } from "../../ModalController.js";

const styles = css`
  display: grid;
  grid-template-rows: auto 500px auto;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    "Open Sans",
    "Helvetica Neue",
    sans-serif;

  & > * {
    padding: 0 2rem;
  }

  & > div {
    background: rgba(102, 51, 153, 0.1);
    padding: 1rem 2rem;
  }

  footer {
    height: 84px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
`;

export const CustomStylesController = new ModalController({
  name: "with-custom-styles",
  props: { className: styles },
  load: async () => import("./Content.js")
});
