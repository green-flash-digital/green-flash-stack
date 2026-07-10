import { useConfigurationContext } from "../Config.context";
import { SpacePreviewContentVariants } from "./SpacePreviewContentVariants";

export function SpacePreviewContent() {
  const { state } = useConfigurationContext();
  switch (state.sizing.space.mode) {
    case "auto":
      return (
        <SpacePreviewContentVariants
          variants={state.sizing.space.auto.variants}
          baseFontSize={state.sizing.baseFontSize}
        />
      );

    case "manual":
      return (
        <SpacePreviewContentVariants
          variants={state.sizing.space.manual.variants}
          baseFontSize={state.sizing.baseFontSize}
        />
      );
    default:
      break;
  }
}
