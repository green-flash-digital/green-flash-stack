// import { useCallback, useMemo, useRef } from "react";

// import type { UseInputDropdownRef } from "../useInputDropdown/useInputDropdown.js";

// export function useInputDropdownControls<InputNode extends HTMLElement>() {
//   const ref = useRef<UseInputDropdownRef<InputNode>>(null);

//   const closeDropdown = useCallback<
//     UseInputDropdownRef<InputNode>["handleClose"]
//   >(() => {
//     if (!ref.current) return;
//     ref.current.handleClose();
//   }, []);

//   const setValue = useCallback<UseInputDropdownRef<InputNode>["setValue"]>(
//     (value) => {
//       if (!ref.current) return;
//       ref.current.setValue(value);
//     },
//     []
//   );

//   return useMemo(
//     () => ({
//       ref,
//       closeDropdown,
//       setValue,
//     }),
//     [closeDropdown, setValue]
//   );
// }
