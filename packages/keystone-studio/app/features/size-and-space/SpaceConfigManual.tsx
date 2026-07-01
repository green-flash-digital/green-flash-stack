import { InputGroup } from "~/components/InputGroup";

import type { ConfigurationContextType } from "../Config.context.js";
import type { ConfigurationStateSizeAndSpace_SpaceManual } from "./size-and-space.utils.js";
import { SpaceConfigVariants } from "./SpaceConfigVariants";

export function SpaceConfigManual({
  baseFontSize,
  state,
  setSizing
}: {
  baseFontSize: number;
  state: ConfigurationStateSizeAndSpace_SpaceManual;
  setSizing: ConfigurationContextType["setSizing"];
}) {
  return (
    <InputGroup>
      <SpaceConfigVariants
        mode="manual"
        setSizing={setSizing}
        variants={state.variants}
        baseFontSize={baseFontSize}
      />
    </InputGroup>
  );
}
