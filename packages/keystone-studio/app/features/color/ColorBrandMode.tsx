import { useConfigurationContext } from "../Config.context";
import { ColorBrandModeAuto } from "./ColorBrandModeAuto";

export function ColorBrandMode() {
  const { color, setColor } = useConfigurationContext();
  return <ColorBrandModeAuto state={color} setColor={setColor} />;
}
