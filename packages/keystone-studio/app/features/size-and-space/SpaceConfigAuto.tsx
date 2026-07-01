import type { ConfigurationContextType } from "../Config.context.js";
import { type ConfigurationStateSizeAndSpace_SpaceAuto } from "./size-and-space.utils.js";
import { SpaceConfigVariants } from "./SpaceConfigVariants.js";

export function SpaceConfigAuto({
  baseFontSize,
  state,
  setSizing
}: {
  baseFontSize: number;
  state: ConfigurationStateSizeAndSpace_SpaceAuto;
  setSizing: ConfigurationContextType["setSizing"];
}) {
  return (
    <SpaceConfigVariants
      mode="auto"
      setSizing={setSizing}
      variants={state.variants}
      baseFontSize={baseFontSize}
    />
  );
}
