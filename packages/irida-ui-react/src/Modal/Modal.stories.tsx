import { ExampleBaseModal } from "./examples/base/index.js";

const meta = {
  title: "Modal",
};
export default meta;

export function Base() {
  return (
    <>
      <ExampleBaseModal.Component />
      <button type="button" onClick={ExampleBaseModal.launch}>
        Launch Modal
      </button>
    </>
  );
}
