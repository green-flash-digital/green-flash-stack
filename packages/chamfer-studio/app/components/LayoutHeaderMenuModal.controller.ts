import { ModalController } from "@stratum-ui/react/modal";

export const layoutHeaderMenuModalController = new ModalController({
  name: "layout-header-menu",
  props: {
    closeOnBackdropClick: true,
    variant: "drawer-right"
  },
  load: () => import("./LayoutHeaderMenuModal.content")
});
