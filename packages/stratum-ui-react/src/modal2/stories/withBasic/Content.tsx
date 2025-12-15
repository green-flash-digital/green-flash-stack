import { useModalContext } from "../../modal.useModalContext.js";

export default function WithBasic() {
  const { onMount } = useModalContext();
  return <dialog ref={onMount}>Hello there!</dialog>;
}
