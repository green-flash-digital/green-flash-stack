import { useConfigurationContext } from "../Config.context";
import { ColorBrandModeAuto } from "./ColorBrandModeAuto";

export function ColorBrandMode() {
  const { state, update } = useConfigurationContext();
  return <ColorBrandModeAuto state={state.color} update={update} />;
}
