import { useState } from "react";

import { ModalRegistry } from "../ModalRegistry.js";
import { BasicController } from "./withBasic/index.js";
import { CustomStylesController } from "./withCustomStyles/index.js";
import { DefaultDrawerController } from "./withDefaultDrawer/index.js";
import { DefaultDrawerRightController } from "./withDefaultDrawerRight/index.js";
import { DismissController } from "./withDismiss/index.js";
import { DrawerDownController } from "./withDrawerDown/index.js";
import { DrawerLeftController } from "./withDrawerLeft/index.js";
import { WithStateController } from "./withState/index.js";

const meta = {
  title: "Modal"
};
export default meta;

export function WithBasic() {
  return (
    <>
      <BasicController.Component />
      <button type="button" onClick={BasicController.launch}>
        Launch WithBasic
      </button>
    </>
  );
}

export function WithDefaultDrawerUp() {
  return (
    <>
      <DefaultDrawerController.Component />
      <button type="button" onClick={DefaultDrawerController.launch}>
        Launch WithDefaultDrawerUp
      </button>
    </>
  );
}

export function WithDefaultDrawerRight() {
  return (
    <>
      <DefaultDrawerRightController.Component />
      <button type="button" onClick={DefaultDrawerRightController.launch}>
        Launch WithDefaultDrawerRight
      </button>
    </>
  );
}

export function WithDrawerLeft() {
  return (
    <>
      <DrawerLeftController.Component />
      <button type="button" onClick={DrawerLeftController.launch}>
        Launch WithDrawerLeft
      </button>
    </>
  );
}

export function WithDrawerDown() {
  return (
    <>
      <DrawerDownController.Component />
      <button type="button" onClick={DrawerDownController.launch}>
        Launch WithDrawerDown
      </button>
    </>
  );
}

export function WithCustomStyles() {
  return (
    <>
      <CustomStylesController.Component />
      <button type="button" onClick={CustomStylesController.launch}>
        Launch WithCustomStyles
      </button>
    </>
  );
}

export function WithState() {
  return (
    <>
      <WithStateController.Component />
      <button
        type="button"
        onClick={() => WithStateController.launch({ uuid: crypto.randomUUID() })}
      >
        Launch WithState
      </button>
    </>
  );
}

export function WithDismiss() {
  const [closeCount, setCloseCount] = useState(0);
  return (
    <>
      <DismissController.Component />
      <p>onClose fired: {closeCount} times</p>
      <button
        type="button"
        onClick={() =>
          DismissController.launch(
            { label: "Close vs. Dismiss" },
            { onClose: () => setCloseCount((c) => c + 1) }
          )
        }
      >
        Launch WithDismiss
      </button>
    </>
  );
}

const Modals = new ModalRegistry();

Modals.register(BasicController);
Modals.register(CustomStylesController);
Modals.register(WithStateController);
Modals.register(DefaultDrawerController);
Modals.register(DefaultDrawerRightController);
Modals.register(DrawerLeftController);
Modals.register(DrawerDownController);
Modals.register(DismissController);

export function WithRegistry() {
  return (
    <>
      {/* Goes somewhere in the root of the app */}
      <Modals.Render />

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <button type="button" onClick={BasicController.launch}>
          Launch WithBasic
        </button>
        <button type="button" onClick={CustomStylesController.launch}>
          Launch WithCustomStyles
        </button>
        <button
          type="button"
          onClick={() => WithStateController.launch({ uuid: crypto.randomUUID() })}
        >
          Launch WithState
        </button>
        <button type="button" onClick={DefaultDrawerController.launch}>
          Launch WithDefaultDrawerUp
        </button>
        <button type="button" onClick={DefaultDrawerRightController.launch}>
          Launch WithDefaultDrawerRight
        </button>
        <button type="button" onClick={DrawerLeftController.launch}>
          Launch WithDrawerLeft
        </button>
        <button type="button" onClick={DrawerDownController.launch}>
          Launch WithDrawerDown
        </button>
      </div>
    </>
  );
}
