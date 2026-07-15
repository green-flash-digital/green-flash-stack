import { css } from "@linaria/core";
import { ModalController } from "@stratum-ui/react/modal";

const styles = css`
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  overflow: hidden;
`;

export const configStyleGuideModalController = new ModalController({
  name: "config-style-guide",
  props: {
    closeOnBackdropClick: true,
    variant: "modal",
    size: "full",
    className: styles
  },
  load: () => import("./ConfigStyleGuideModal.content")
});
