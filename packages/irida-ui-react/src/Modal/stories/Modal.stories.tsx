import { BasicController } from "./withBasic/index.js";
import { DefaultModalController } from "./withDefaultModal/index.js";
import { CustomStylesController } from "./withCustomStyles/index.js";
import { ModalRegistry } from "../ModalRegistry.js";
import { WithStateController } from "./withState/index.js";

const meta = {
  title: "Modal",
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

export function WithDefaultModal() {
  return (
    <>
      <DefaultModalController.Component />
      <button type="button" onClick={DefaultModalController.launch}>
        Launch WithDefaultModal
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
        onClick={() =>
          WithStateController.launch({ uuid: crypto.randomUUID() })
        }
      >
        Launch WithState
      </button>
    </>
  );
}

const Modals = new ModalRegistry();

Modals.register(BasicController);
Modals.register(DefaultModalController);
Modals.register(CustomStylesController);
Modals.register(WithStateController);

export function WithRegistry() {
  return (
    <>
      {/* Goes somewhere ein the root of the app */}
      <Modals.Render />

      <div style={{ display: "flex", gap: "1rem" }}>
        <button type="button" onClick={BasicController.launch}>
          Launch WithBasic
        </button>
        <button type="button" onClick={DefaultModalController.launch}>
          Launch WithDefaultModal
        </button>
        <button type="button" onClick={CustomStylesController.launch}>
          Launch WithCustomStyles
        </button>
        <button type="button" onClick={WithStateController.launch}>
          Launch WithState
        </button>
      </div>
    </>
  );
}
