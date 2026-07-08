import { useRef } from "react";

import type { ModalOptions } from "./Modal.engine";
import { ModalEngine } from "./Modal.engine";

export function useModal(options?: Partial<ModalOptions>) {
  const ref = useRef<ModalEngine>(new ModalEngine(options));

  //   useEffect(() => {
  //     // destroy the modal on unmount
  //     return () => {
  //       // ref.current
  //     };
  //   }, []);

  return ref.current;
}
