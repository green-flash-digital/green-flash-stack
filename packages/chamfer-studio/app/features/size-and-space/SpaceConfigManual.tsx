import type { Updater } from "use-immer";

import { InputGroup } from "~/components/InputGroup";

import type { StudioState, ConfigurationStateSizeAndSpace_SpaceManual } from "../studio.state";
import { SpaceConfigVariants } from "./SpaceConfigVariants";

export function SpaceConfigManual({
  baseFontSize,
  state,
  update
}: {
  baseFontSize: number;
  state: ConfigurationStateSizeAndSpace_SpaceManual;
  update: Updater<StudioState>;
}) {
  return (
    <InputGroup>
      <SpaceConfigVariants
        mode="manual"
        update={update}
        variants={state.variants}
        baseFontSize={baseFontSize}
      />
    </InputGroup>
  );
}
