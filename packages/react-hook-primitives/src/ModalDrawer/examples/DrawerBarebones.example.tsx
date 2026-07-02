import { Drawer } from "../ModalDrawer.js";
import { useDrawer } from "../modal-drawer.useDrawer.js";

export default () => {
  const { drawerRef, openDrawer } = useDrawer();

  return (
    <>
      <button type="button" onClick={openDrawer}>
        Open drawer without style
      </button>
      <Drawer ref={drawerRef} dxOrientation="slide-left">
        This is some drawer content!
      </Drawer>
    </>
  );
};
