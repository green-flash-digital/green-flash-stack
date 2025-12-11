import { useModalContext } from "../../modal-controller.utils.js";

export default function BaseContent() {
  const { onMount } = useModalContext();
  return <dialog ref={onMount}>Hello there!</dialog>;
}
