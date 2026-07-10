import type { Updater } from "use-immer";

import type { StudioState, ConfigurationStateSizeAndSpace_SpaceAuto } from "../studio.state";
import { SpaceConfigVariants } from "./SpaceConfigVariants.js";

export function SpaceConfigAuto({
  baseFontSize,
  state,
  update
}: {
  baseFontSize: number;
  state: ConfigurationStateSizeAndSpace_SpaceAuto;
  update: Updater<StudioState>;
}) {
  return (
    <SpaceConfigVariants
      mode="auto"
      update={update}
      variants={state.variants}
      baseFontSize={baseFontSize}
    />
  );
}
