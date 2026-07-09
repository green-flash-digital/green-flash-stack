import { InputHue } from "~/components/InputHue";
import { InputLabel } from "~/components/InputLabel";

export function ColorSwatchHue(props: { hue: number; onChangeHue: (value: number) => void }) {
  return (
    <InputLabel
      dxLabel="Hue"
      dxHelp="The position of the color on the visible spectrum"
      dxSize="dense"
    >
      <InputHue value={props.hue} dxOnChange={props.onChangeHue} />
    </InputLabel>
  );
}
