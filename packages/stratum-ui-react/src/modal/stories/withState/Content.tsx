import { useModalContext } from "../../modal.useModalContext.js";

export type CustomState = { uuid: string };

export default function WithStateModal() {
  const {
    state: { uuid }
  } = useModalContext<CustomState>();

  return (
    <div style={{ padding: "2rem" }}>
      <h2>With State</h2>
      <dl>
        <dt>uuid</dt>
        <dd>{uuid}</dd>
      </dl>
    </div>
  );
}
