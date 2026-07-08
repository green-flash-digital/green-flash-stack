import { useRef } from "react";

import type { PopoverOptions } from "./Popover";
import { Popover } from "./Popover";

export function usePopover(options?: Partial<PopoverOptions>) {
  const ref = useRef<Popover>(new Popover(options));
  return ref.current;
}
