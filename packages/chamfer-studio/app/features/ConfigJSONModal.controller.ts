import { css } from "@linaria/core";
import { ModalController } from "@stratum-ui/react/modal";

const styles = css`
  && {
    height: 100%;
    display: grid;
    grid-template-rows: auto auto 1fr;
    overflow: hidden;
  }
`;

export const configJSONModalController = new ModalController({
  name: "config-json",
  props: {
    variant: "drawer-right",
    size: "md",
    className: styles
  },
  load: () => import("./ConfigJSONModal.content")
});
