import type { ChangeEventHandler } from "react";

import { InputHue } from "~/components/InputHue";
import { InputLabel } from "~/components/InputLabel";

export function ColorSwatchHue(props: {
  hue: number;
  onChangeHue: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <InputLabel
      dxLabel="Hue"
      dxHelp="The position of the color on the visible spectrum"
      dxSize="dense"
    >
      <InputHue value={props.hue} onChange={props.onChangeHue} />
    </InputLabel>
  );
}
